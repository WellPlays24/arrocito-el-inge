// src/routes/orders.routes.js
const express = require('express');
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
} = require('../controllers/orders.controller');

const {
  authRequired,
  roleRequired,
} = require('../middleware/auth.middleware');

const router = express.Router();

// Listar pedidos
// GET /api/orders
router.get('/', authRequired,getAllOrders);

// Obtener pedido por id (con items + complementos)
// GET /api/orders/:id
router.get('/:id', authRequired,getOrderById);

// Crear pedido
// POST /api/orders
router.post('/', authRequired,createOrder);

// Actualizar estado del pedido
// PATCH /api/orders/:id/status
// SOLO ADMIN cambia estado
router.patch('/:id/status',authRequired, roleRequired('admin'), updateOrderStatus);

module.exports = router;
