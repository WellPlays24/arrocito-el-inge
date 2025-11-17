// src/routes/dailyExpenses.routes.js
const express = require('express');
const {
  getAllDailyExpenses,
  getDailyExpenseById,
  createDailyExpense,
  updateDailyExpense,
  deleteDailyExpense,
} = require('../controllers/dailyExpenses.controller');

const {
  authRequired,
  roleRequired,
} = require('../middleware/auth.middleware');

const router = express.Router();

// Listar gastos (con filtros de fecha)
// GET /api/daily-expenses
router.get('/', authRequired, roleRequired('admin'),getAllDailyExpenses);

// Obtener gasto por id
// GET /api/daily-expenses/:id
router.get('/:id',authRequired, roleRequired('admin'), getDailyExpenseById);

// Crear gasto
// POST /api/daily-expenses
router.post('/', authRequired, roleRequired('admin'),createDailyExpense);

// Actualizar gasto
// PUT /api/daily-expenses/:id
router.put('/:id', authRequired, roleRequired('admin'),updateDailyExpense);

// Eliminar gasto
// DELETE /api/daily-expenses/:id
router.delete('/:id', authRequired, roleRequired('admin'),deleteDailyExpense);

module.exports = router;
