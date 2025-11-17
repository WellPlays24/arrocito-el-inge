// src/controllers/creditDebts.controller.js
const db = require('../db');
const { pool } = db;

// GET /api/credit-debts
// Filtros opcionales: ?isPaid=true/false  &  ?userId=ID
async function getAllCreditDebts(req, res) {
  try {
    const { isPaid, userId } = req.query;
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (isPaid === 'true') {
      conditions.push(`cd.is_paid = TRUE`);
    } else if (isPaid === 'false') {
      conditions.push(`cd.is_paid = FALSE`);
    }

    if (userId) {
      conditions.push(`cd.user_id = $${paramIndex}`);
      params.push(userId);
      paramIndex++;
    }

    let sql = `
      SELECT
        cd.id,
        cd.user_id,
        u.name AS user_name,
        cd.order_id,
        o.total_amount,
        cd.amount_due,
        cd.is_paid,
        cd.created_at,
        cd.updated_at,
        cd.paid_at
      FROM credit_debts cd
      JOIN users u ON u.id = cd.user_id
      JOIN orders o ON o.id = cd.order_id
    `;

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY cd.created_at DESC';

    const result = await db.query(sql, params);
    return res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener deudas:', error);
    return res.status(500).json({ message: 'Error al obtener deudas' });
  }
}

// GET /api/credit-debts/:id
async function getCreditDebtById(req, res) {
  try {
    const { id } = req.params;

    const sql = `
      SELECT
        cd.id,
        cd.user_id,
        u.name AS user_name,
        cd.order_id,
        o.total_amount,
        cd.amount_due,
        cd.is_paid,
        cd.created_at,
        cd.updated_at,
        cd.paid_at
      FROM credit_debts cd
      JOIN users u ON u.id = cd.user_id
      JOIN orders o ON o.id = cd.order_id
      WHERE cd.id = $1
    `;

    const result = await db.query(sql, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Deuda no encontrada' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener deuda:', error);
    return res.status(500).json({ message: 'Error al obtener deuda' });
  }
}

// POST /api/credit-debts
// Crea una deuda a partir de un pedido existente
// Body: { order_id, amount_due? }
async function createCreditDebtFromOrder(req, res) {
  const client = await pool.connect();

  try {
    const { order_id, amount_due } = req.body;

    if (!order_id) {
      return res.status(400).json({ message: 'order_id es obligatorio' });
    }

    // 1) Verificar que el pedido exista y tenga user_id
    const orderRes = await client.query(
      `SELECT id, user_id, total_amount, is_credit
       FROM orders
       WHERE id = $1`,
      [order_id]
    );

    if (orderRes.rowCount === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    const order = orderRes.rows[0];

    if (!order.user_id) {
      return res
        .status(400)
        .json({ message: 'El pedido no tiene un usuario asociado' });
    }

    // 2) Verificar que no exista ya una deuda para este pedido
    const existingDebtRes = await client.query(
      `SELECT id FROM credit_debts WHERE order_id = $1`,
      [order_id]
    );

    if (existingDebtRes.rowCount > 0) {
      return res
        .status(400)
        .json({ message: 'Este pedido ya tiene una deuda registrada' });
    }

    const finalAmount = amount_due != null ? amount_due : order.total_amount;

    if (finalAmount == null || finalAmount < 0) {
      return res
        .status(400)
        .json({ message: 'amount_due debe ser mayor o igual a 0' });
    }

    // 3) Transacción: marcar pedido como crédito + crear deuda
    await client.query('BEGIN');

    await client.query(
      `UPDATE orders
       SET is_credit = TRUE,
           updated_at = NOW()
       WHERE id = $1`,
      [order_id]
    );

    const debtRes = await client.query(
      `INSERT INTO credit_debts (user_id, order_id, amount_due)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, order_id, amount_due, is_paid, created_at, updated_at, paid_at`,
      [order.user_id, order_id, finalAmount]
    );

    await client.query('COMMIT');

    return res.status(201).json(debtRes.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al crear deuda:', error);
    return res.status(500).json({ message: 'Error al crear deuda' });
  } finally {
    client.release();
  }
}

// PATCH /api/credit-debts/:id/pay
// Marca una deuda como pagada
async function markCreditDebtAsPaid(req, res) {
  try {
    const { id } = req.params;

    const result = await db.query(
      `UPDATE credit_debts
       SET is_paid = TRUE,
           paid_at = NOW(),
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, user_id, order_id, amount_due, is_paid, created_at, updated_at, paid_at`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Deuda no encontrada' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al marcar deuda como pagada:', error);
    return res
      .status(500)
      .json({ message: 'Error al marcar deuda como pagada' });
  }
}

module.exports = {
  getAllCreditDebts,
  getCreditDebtById,
  createCreditDebtFromOrder,
  markCreditDebtAsPaid,
};
