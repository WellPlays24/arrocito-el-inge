// src/controllers/dailyExpenses.controller.js
const db = require('../db');

// GET /api/daily-expenses
// Filtros opcionales:
//   ?date=2025-11-16
//   ?from=2025-11-01&to=2025-11-16
async function getAllDailyExpenses(req, res) {
  try {
    const { date, from, to } = req.query;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (date) {
      conditions.push(`date = $${idx}`);
      params.push(date);
      idx++;
    } else {
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
    }

    let sql = `
      SELECT id, date, amount, description, created_at, updated_at
      FROM daily_expenses
    `;

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY date DESC, id DESC';

    const result = await db.query(sql, params);
    return res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener gastos diarios:', error);
    return res
      .status(500)
      .json({ message: 'Error al obtener gastos diarios' });
  }
}

// GET /api/daily-expenses/:id
async function getDailyExpenseById(req, res) {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT id, date, amount, description, created_at, updated_at
       FROM daily_expenses
       WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Gasto no encontrado' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener gasto diario:', error);
    return res.status(500).json({ message: 'Error al obtener gasto diario' });
  }
}

// POST /api/daily-expenses
// Body:
// { "date": "2025-11-16", "amount": 25.50, "description": "pollo, arroz, gas" }
async function createDailyExpense(req, res) {
  try {
    const { date, amount, description } = req.body;

    if (!date || amount == null) {
      return res
        .status(400)
        .json({ message: 'date y amount son obligatorios' });
    }

    if (Number(amount) < 0) {
      return res
        .status(400)
        .json({ message: 'amount debe ser mayor o igual a 0' });
    }

    const result = await db.query(
      `INSERT INTO daily_expenses (date, amount, description)
       VALUES ($1, $2, $3)
       RETURNING id, date, amount, description, created_at, updated_at`,
      [date, amount, description || null]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear gasto diario:', error);
    return res.status(500).json({ message: 'Error al crear gasto diario' });
  }
}

// PUT /api/daily-expenses/:id
async function updateDailyExpense(req, res) {
  try {
    const { id } = req.params;
    const { date, amount, description } = req.body;

    if (amount != null && Number(amount) < 0) {
      return res
        .status(400)
        .json({ message: 'amount debe ser mayor o igual a 0' });
    }

    const result = await db.query(
      `UPDATE daily_expenses
       SET
         date = COALESCE($1, date),
         amount = COALESCE($2, amount),
         description = COALESCE($3, description),
         updated_at = NOW()
       WHERE id = $4
       RETURNING id, date, amount, description, created_at, updated_at`,
      [date || null, amount, description || null, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Gasto no encontrado' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar gasto diario:', error);
    return res
      .status(500)
      .json({ message: 'Error al actualizar gasto diario' });
  }
}

// DELETE /api/daily-expenses/:id
async function deleteDailyExpense(req, res) {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM daily_expenses WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Gasto no encontrado' });
    }

    return res.json({ message: 'Gasto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar gasto diario:', error);
    return res
      .status(500)
      .json({ message: 'Error al eliminar gasto diario' });
  }
}

module.exports = {
  getAllDailyExpenses,
  getDailyExpenseById,
  createDailyExpense,
  updateDailyExpense,
  deleteDailyExpense,
};
