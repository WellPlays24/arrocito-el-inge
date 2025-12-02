// src/controllers/orders.controller.js
const db = require('../db');
const { pool } = db;

// ---------------------------------------------------------------------
// GET /api/orders
// Filtros opcionales: ?userId=1  &  ?status=pending|completed|cancelled
// ---------------------------------------------------------------------
async function getAllOrders(req, res) {
  try {


    let { userId, status } = req.query;
    const isAdmin = req.user?.role === 'admin';

    const conditions = [];
    const params = [];
    let idx = 1;

    // Si NO es admin, obligamos a que solo vea sus propios pedidos
    if (!isAdmin) {
      userId = req.user.id;
    }

    if (userId) {
      conditions.push(`o.user_id = $${idx}`);
      params.push(userId);
      idx++;
    }

    if (status && ['pending', 'completed', 'cancelled'].includes(status)) {
      conditions.push(`o.status = $${idx}`);
      params.push(status);
      idx++;
    }

    let sql = `
      SELECT
        o.id,
        o.user_id,
        u.name AS user_name,
        o.order_date,
        o.total_amount,
        o.payment_method,
        o.is_credit,
        o.status,
        o.notes,
        o.created_at,
        o.updated_at
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
    `;

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY o.order_date DESC, o.id DESC';

    const result = await db.query(sql, params);
    return res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    return res.status(500).json({ message: 'Error al obtener pedidos' });
  }
}

// ---------------------------------------------------------------------
// GET /api/orders/:id
// Devuelve el pedido + items + complementos
// ---------------------------------------------------------------------
async function getOrderById(req, res) {
  try {
    const { id } = req.params;

    // 1) Datos del pedido
    const orderRes = await db.query(
      `
      SELECT
        o.id,
        o.user_id,
        u.name AS user_name,
        o.order_date,
        o.total_amount,
        o.payment_method,
        o.is_credit,
        o.status,
        o.notes,
        o.created_at,
        o.updated_at
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
      WHERE o.id = $1
      `,
      [id]
    );

    if (orderRes.rowCount === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    const order = orderRes.rows[0];

    const isAdmin = req.user?.role === 'admin';

    // Si es cliente, solo puede ver pedidos suyos
    if (!isAdmin && order.user_id !== req.user.id) {
      return res.status(403).json({ message: 'No puedes ver este pedido' });
    }

    // 2) Items del pedido
    const itemsRes = await db.query(
      `
      SELECT
        oi.id,
        oi.product_id,
        p.name AS product_name,
        p.price AS product_price,
        oi.quantity,
        oi.subtotal
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = $1
      `,
      [id]
    );

    const items = itemsRes.rows;

    // 3) Complementos por item
    const itemIds = items.map((i) => i.id);
    let complementsByItem = {};

    if (itemIds.length > 0) {
      const complementsRes = await db.query(
        `
        SELECT
          oic.order_item_id,
          c.id AS complement_id,
          c.name AS complement_name,
          c.type,
          c.price
        FROM order_item_complements oic
        JOIN complements c ON c.id = oic.complement_id
        WHERE oic.order_item_id = ANY($1::int[])
        `,
        [itemIds]
      );

      complementsByItem = complementsRes.rows.reduce((acc, row) => {
        if (!acc[row.order_item_id]) {
          acc[row.order_item_id] = [];
        }
        acc[row.order_item_id].push({
          id: row.complement_id,
          name: row.complement_name,
          type: row.type,
          price: row.price,
        });
        return acc;
      }, {});
    }

    // 4) Armar estructura final
    const itemsWithComplements = items.map((item) => ({
      ...item,
      complements: complementsByItem[item.id] || [],
    }));

    return res.json({
      ...order,
      items: itemsWithComplements,
    });
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    return res.status(500).json({ message: 'Error al obtener pedido' });
  }
}

// ---------------------------------------------------------------------
// POST /api/orders
// Crea un pedido con items y complementos
// Body esperado:
// {
//   "user_id": 1,               // opcional si permites pedidos anónimos
//   "payment_method": "cash",   // 'cash' | 'transfer'
//   "notes": "sin ensalada",
//   "items": [
//     {
//       "product_id": 1,
//       "quantity": 2,
//       "complements": [1, 2]   // ids de complements
//     },
//     ...
//   ]
// }
// ---------------------------------------------------------------------
async function createOrder(req, res) {
  const client = await pool.connect();

  try {
    const { user_id, payment_method, notes, items } = req.body;

    if (!payment_method || !['cash', 'transfer'].includes(payment_method)) {
      return res
        .status(400)
        .json({ message: "payment_method debe ser 'cash' o 'transfer'" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: 'Debes enviar al menos un item en el pedido' });
    }

    // 1) Calcular total recorriendo los items y consultando precios desde products
    await client.query('BEGIN');

    let totalAmount = 0;
    const itemDetails = [];

    for (const item of items) {
      const { product_id, quantity, complements } = item;

      if (!product_id || !quantity || quantity <= 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          message:
            'Cada item debe tener product_id y quantity > 0',
        });
      }

      const productRes = await client.query(
        'SELECT id, price FROM products WHERE id = $1 AND is_active = TRUE',
        [product_id]
      );

      if (productRes.rowCount === 0) {
        await client.query('ROLLBACK');
        return res
          .status(400)
          .json({ message: `Producto ${product_id} no existe o está inactivo` });
      }

      const product = productRes.rows[0];
      const subtotal = Number(product.price) * quantity;
      totalAmount += subtotal;

      itemDetails.push({
        product_id,
        quantity,
        subtotal,
        complements: Array.isArray(complements) ? complements : [],
      });
    }

    // 2) Insertar en orders
    const orderRes = await client.query(
      `
      INSERT INTO orders (user_id, total_amount, payment_method, is_credit, status, notes)
      VALUES ($1, $2, $3, FALSE, 'pending', $4)
      RETURNING id, user_id, order_date, total_amount, payment_method, is_credit, status, notes, created_at, updated_at
      `,
      [user_id || null, totalAmount, payment_method, notes || null]
    );

    const order = orderRes.rows[0];
    const orderId = order.id;

    // 3) Insertar order_items y order_item_complements
    const itemsInserted = [];

    for (const detail of itemDetails) {
      const itemRes = await client.query(
        `
        INSERT INTO order_items (order_id, product_id, quantity, subtotal)
        VALUES ($1, $2, $3, $4)
        RETURNING id, product_id, quantity, subtotal
        `,
        [orderId, detail.product_id, detail.quantity, detail.subtotal]
      );

      const orderItem = itemRes.rows[0];
      const orderItemId = orderItem.id;

      // Complementos
      if (detail.complements.length > 0) {
        // Validar que existan complementos
        for (const complementId of detail.complements) {
          await client.query(
            `
            INSERT INTO order_item_complements (order_item_id, complement_id)
            VALUES ($1, $2)
            `,
            [orderItemId, complementId]
          );
        }
      }

      itemsInserted.push({
        ...orderItem,
        complements: detail.complements,
      });
    }

    await client.query('COMMIT');

    return res.status(201).json({
      ...order,
      items: itemsInserted,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al crear pedido:', error);
    return res.status(500).json({ message: 'Error al crear pedido' });
  } finally {
    client.release();
  }
}


// ---------------------------------------------------------------------
// PATCH /api/orders/:id/status
// Body: { status: 'pending' | 'completed' | 'cancelled' }
// ---------------------------------------------------------------------
async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        message: "status debe ser 'pending', 'completed' o 'cancelled'",
      });
    }

    const result = await db.query(
      `
      UPDATE orders
      SET status = $1,
      updated_at = NOW()
      WHERE id = $2
      RETURNING id, user_id, order_date, total_amount, payment_method, is_credit, status, notes, created_at, updated_at
      `,
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    const updatedOrder = result.rows[0];

    // Si el pedido se completó, actualizamos el resumen diario
    if (status === 'completed') {
      const { calculateAndSaveDailySummary } = require('./dailySummary.controller');
      const orderDate = new Date(updatedOrder.order_date).toISOString().split('T')[0];
      await calculateAndSaveDailySummary(orderDate);
    }

    return res.json(updatedOrder);
  } catch (error) {
    console.error('Error al actualizar estado del pedido:', error);
    return res
      .status(500)
      .json({ message: 'Error al actualizar estado del pedido' });
  }
}

// ---------------------------------------------------------------------
// DELETE /api/orders/:id
// Elimina un pedido (solo admin)
// ---------------------------------------------------------------------
async function deleteOrder(req, res) {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    await client.query('BEGIN');

    // Delete order_item_complements first (foreign key constraint)
    await client.query(
      `DELETE FROM order_item_complements 
       WHERE order_item_id IN (
         SELECT id FROM order_items WHERE order_id = $1
       )`,
      [id]
    );

    // Delete order_items
    await client.query('DELETE FROM order_items WHERE order_id = $1', [id]);

    // Delete the order
    const result = await client.query(
      'DELETE FROM orders WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    await client.query('COMMIT');
    return res.json({ message: 'Pedido eliminado exitosamente' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al eliminar pedido:', error);
    return res.status(500).json({ message: 'Error al eliminar pedido' });
  } finally {
    client.release();
  }
}

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
};
