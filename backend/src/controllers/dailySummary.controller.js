// src/controllers/dailySummary.controller.js
const db = require('../db');

// GET /api/daily-summary
// Filtros opcionales: ?from=2025-11-01&to=2025-11-30
async function getDailySummaryList(req, res) {
  try {
    const { from, to } = req.query;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (from) {
      conditions.push(`date >= $${idx}`);
      params.push(from);
      idx++;
    }
    if (to) {
      conditions.push(`date <= $${idx}`);
      params.push(to);
      idx++;
    }

    let sql = `
      SELECT id, date, total_sales, total_expenses, net_profit
      FROM daily_summary
    `;

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY date DESC';

    const result = await db.query(sql, params);
    return res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener resumen diario:', error);
    return res
      .status(500)
      .json({ message: 'Error al obtener resumen diario' });
  }
}

// GET /api/daily-summary/by-date/:date  (ej: 2025-11-16)
// OR GET /api/daily-summary?date=2025-11-16
async function getDailySummaryByDate(req, res) {
  try {
    const date = req.params.date || req.query.date || new Date().toISOString().split('T')[0];

    // Calculate metrics in real-time from orders table
    const ordersRes = await db.query(
      `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'completed') AS completed_orders,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending_orders,
        COUNT(*) AS total_orders,
        COALESCE(SUM(total_amount) FILTER (WHERE status = 'completed'), 0) AS total_sales
      FROM orders
      WHERE DATE(order_date) = $1
      `,
      [date]
    );

    const expensesRes = await db.query(
      `SELECT COALESCE(SUM(amount), 0) AS total_expenses
       FROM daily_expenses
       WHERE date = $1`,
      [date]
    );

    const totalSales = Number(ordersRes.rows[0].total_sales) || 0;
    const totalExpenses = Number(expensesRes.rows[0].total_expenses) || 0;
    const netProfit = totalSales - totalExpenses;
    const totalOrders = Number(ordersRes.rows[0].total_orders) || 0;
    const completedOrders = Number(ordersRes.rows[0].completed_orders) || 0;
    const pendingOrders = Number(ordersRes.rows[0].pending_orders) || 0;

    return res.json({
      date,
      totalSales: totalSales,
      total_sales: totalSales, // Both formats for compatibility
      totalExpenses: totalExpenses,
      total_expenses: totalExpenses,
      netProfit: netProfit,
      net_profit: netProfit,
      totalOrders: totalOrders,
      total_orders: totalOrders,
      completedOrders: completedOrders,
      completed_orders: completedOrders,
      pendingOrders: pendingOrders,
      pending_orders: pendingOrders,
    });
  } catch (error) {
    console.error('Error al obtener resumen por fecha:', error);
    return res
      .status(500)
      .json({ message: 'Error al obtener resumen por fecha' });
  }
}

// Helper para calcular y actualizar el resumen de un día
async function calculateAndSaveDailySummary(date) {
  // Ventas del día (solo pedidos completados)
  const salesRes = await db.query(
    `
    SELECT COALESCE(SUM(total_amount), 0) AS total_sales
    FROM orders
    WHERE status = 'completed'
      AND DATE(order_date) = $1
    `,
    [date]
  );

  const expensesRes = await db.query(
    `
    SELECT COALESCE(SUM(amount), 0) AS total_expenses
    FROM daily_expenses
    WHERE date = $1
    `,
    [date]
  );

  const totalSales = Number(salesRes.rows[0].total_sales) || 0;
  const totalExpenses = Number(expensesRes.rows[0].total_expenses) || 0;
  const netProfit = totalSales - totalExpenses;

  const upsertRes = await db.query(
    `
    INSERT INTO daily_summary (date, total_sales, total_expenses, net_profit)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (date)
    DO UPDATE SET
      total_sales = EXCLUDED.total_sales,
      total_expenses = EXCLUDED.total_expenses,
      net_profit = EXCLUDED.net_profit
    RETURNING id, date, total_sales, total_expenses, net_profit
    `,
    [date, totalSales, totalExpenses, netProfit]
  );

  return upsertRes.rows[0];
}

// POST /api/daily-summary/recalculate
// Body: { "date": "2025-11-16" }
async function recalculateDailySummary(req, res) {
  try {
    const { date } = req.body;

    if (!date) {
      return res
        .status(400)
        .json({ message: 'date es obligatorio (YYYY-MM-DD)' });
    }

    const summary = await calculateAndSaveDailySummary(date);

    return res.json({
      message: 'Resumen recalculado correctamente',
      summary,
    });
  } catch (error) {
    console.error('Error al recalcular resumen diario:', error);
    return res
      .status(500)
      .json({ message: 'Error al recalcular resumen diario' });
  }
}

// DELETE /api/daily-summary/:id   (por si quieres limpiar datos)
async function deleteDailySummary(req, res) {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM daily_summary WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Resumen no encontrado' });
    }

    return res.json({ message: 'Resumen eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar resumen diario:', error);
    return res
      .status(500)
      .json({ message: 'Error al eliminar resumen diario' });
  }
}

// GET /api/daily-summary/total-sales
// Retorna la suma total de ventas históricas
async function getTotalSales(req, res) {
  try {
    const result = await db.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS total_sales
       FROM orders
       WHERE status = 'completed'`
    );
    return res.json({ total_sales: result.rows[0].total_sales });
  } catch (error) {
    console.error('Error al obtener ventas totales:', error);
    return res.status(500).json({ message: 'Error al obtener ventas totales' });
  }
}

// GET /api/daily-summary/range
// Query: ?from=2025-11-01&to=2025-11-30
async function getDailySummaryRange(req, res) {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ message: 'from y to son obligatorios' });
    }

    // 1. Calculate aggregated metrics from orders
    const ordersRes = await db.query(
      `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'completed') AS completed_orders,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending_orders,
        COUNT(*) AS total_orders,
        COALESCE(SUM(total_amount) FILTER (WHERE status = 'completed'), 0) AS total_sales
      FROM orders
      WHERE DATE(order_date) >= $1 AND DATE(order_date) <= $2
      `,
      [from, to]
    );

    // 2. Calculate aggregated expenses
    const expensesRes = await db.query(
      `
      SELECT COALESCE(SUM(amount), 0) AS total_expenses
      FROM daily_expenses
      WHERE date >= $1 AND date <= $2
      `,
      [from, to]
    );

    // 3. Calculate top products for the range
    const topProductsRes = await db.query(
      `
      SELECT 
        p.name,
        SUM(oi.quantity) as quantity,
        SUM(oi.subtotal) as total
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      JOIN products p ON p.id = oi.product_id
      WHERE o.status = 'completed'
        AND DATE(o.order_date) >= $1 
        AND DATE(o.order_date) <= $2
      GROUP BY p.id, p.name
      ORDER BY quantity DESC
      LIMIT 5
      `,
      [from, to]
    );

    const totalSales = Number(ordersRes.rows[0].total_sales) || 0;
    const totalExpenses = Number(expensesRes.rows[0].total_expenses) || 0;
    const netProfit = totalSales - totalExpenses;
    const totalOrders = Number(ordersRes.rows[0].total_orders) || 0;
    const completedOrders = Number(ordersRes.rows[0].completed_orders) || 0;
    const pendingOrders = Number(ordersRes.rows[0].pending_orders) || 0;

    return res.json({
      from,
      to,
      totalSales,
      total_sales: totalSales,
      totalExpenses,
      total_expenses: totalExpenses,
      netProfit,
      net_profit: netProfit,
      totalOrders,
      total_orders: totalOrders,
      completedOrders,
      completed_orders: completedOrders,
      pendingOrders,
      pending_orders: pendingOrders,
      topProducts: topProductsRes.rows
    });

  } catch (error) {
    console.error('Error al obtener resumen por rango:', error);
    return res.status(500).json({ message: 'Error al obtener resumen por rango' });
  }
}

module.exports = {
  getDailySummaryList,
  getDailySummaryByDate,
  getDailySummaryRange,
  recalculateDailySummary,
  deleteDailySummary,
  calculateAndSaveDailySummary,
  getTotalSales,
};
