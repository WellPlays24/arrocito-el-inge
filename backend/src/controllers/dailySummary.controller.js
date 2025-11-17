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
async function getDailySummaryByDate(req, res) {
  try {
    const { date } = req.params;

    const result = await db.query(
      `SELECT id, date, total_sales, total_expenses, net_profit
       FROM daily_summary
       WHERE date = $1`,
      [date]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'No hay resumen para esa fecha' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener resumen por fecha:', error);
    return res
      .status(500)
      .json({ message: 'Error al obtener resumen por fecha' });
  }
}

// POST /api/daily-summary/recalculate
// Body: { "date": "2025-11-16" }
// Calcula desde orders (ventas) y daily_expenses (gastos) y hace UPSERT
async function recalculateDailySummary(req, res) {
  try {
    const { date } = req.body;

    if (!date) {
      return res
        .status(400)
        .json({ message: 'date es obligatorio (YYYY-MM-DD)' });
    }

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

    return res.json({
      message: 'Resumen recalculado correctamente',
      summary: upsertRes.rows[0],
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

module.exports = {
  getDailySummaryList,
  getDailySummaryByDate,
  recalculateDailySummary,
  deleteDailySummary,
};
