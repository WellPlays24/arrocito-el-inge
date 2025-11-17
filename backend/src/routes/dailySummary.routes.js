// src/routes/dailySummary.routes.js
const express = require('express');
const {
  getDailySummaryList,
  getDailySummaryByDate,
  recalculateDailySummary,
  deleteDailySummary,
} = require('../controllers/dailySummary.controller');

const {
  authRequired,
  roleRequired,
} = require('../middleware/auth.middleware');

const router = express.Router();

// Listar resúmenes (con rango de fechas opcional)
// GET /api/daily-summary
router.get('/', authRequired, roleRequired('admin'),getDailySummaryList);

// Obtener resumen por fecha exacta
// GET /api/daily-summary/by-date/2025-11-16
router.get('/by-date/:date', authRequired, roleRequired('admin'),getDailySummaryByDate);

// Recalcular resumen de una fecha (ventas - gastos)
// POST /api/daily-summary/recalculate
router.post('/recalculate', authRequired, roleRequired('admin'),recalculateDailySummary);

// Eliminar un resumen por id
// DELETE /api/daily-summary/:id
router.delete('/:id', authRequired, roleRequired('admin'),deleteDailySummary);

module.exports = router;
