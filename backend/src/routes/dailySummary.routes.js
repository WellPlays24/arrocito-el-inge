// src/routes/dailySummary.routes.js
const express = require('express');
const {
  getDailySummaryList,
  getDailySummaryByDate,
  getDailySummaryRange,
  recalculateDailySummary,
  deleteDailySummary,
  getTotalSales,
} = require('../controllers/dailySummary.controller');

const {
  authRequired,
  roleRequired,
} = require('../middleware/auth.middleware');

const router = express.Router();

// Listar resúmenes (con rango de fechas opcional)
// GET /api/daily-summary
// OR GET /api/daily-summary?date=2025-11-16 (for specific date)
router.get('/', authRequired, roleRequired('admin'), (req, res) => {
  if (req.query.date) {
    return getDailySummaryByDate(req, res);
  }
  return getDailySummaryList(req, res);
});

// Obtener resumen por fecha exacta
// GET /api/daily-summary/by-date/2025-11-16
router.get('/by-date/:date', authRequired, roleRequired('admin'), getDailySummaryByDate);

// Recalcular resumen de una fecha (ventas - gastos)
// POST /api/daily-summary/recalculate
router.post('/recalculate', authRequired, roleRequired('admin'), recalculateDailySummary);

// Eliminar un resumen por id
// DELETE /api/daily-summary/:id
router.delete('/:id', authRequired, roleRequired('admin'), deleteDailySummary);

// Obtener resumen por rango de fechas
// GET /api/daily-summary/range?from=2025-11-01&to=2025-11-30
router.get('/range', authRequired, roleRequired('admin'), getDailySummaryRange);

// Obtener ventas totales históricas
// GET /api/daily-summary/total-sales
router.get('/total-sales', authRequired, roleRequired('admin'), getTotalSales);

module.exports = router;
