// src/routes/creditDebts.routes.js
const express = require('express');
const {
  getAllCreditDebts,
  getCreditDebtById,
  createCreditDebtFromOrder,
  markCreditDebtAsPaid,
} = require('../controllers/creditDebts.controller');

const {
  authRequired,
  roleRequired,
} = require('../middleware/auth.middleware');

const router = express.Router();

// Listar deudas (con filtros opcionales)
router.get('/', authRequired, roleRequired('admin'), getAllCreditDebts);

// Obtener una deuda por id
router.get('/:id', authRequired, roleRequired('admin'), getCreditDebtById);

// Crear deuda desde un pedido
router.post('/', authRequired, roleRequired('admin'), createCreditDebtFromOrder);

// Marcar deuda como pagada
router.patch(
  '/:id/pay',
  authRequired,
  roleRequired('admin'),
  markCreditDebtAsPaid
);

module.exports = router;
