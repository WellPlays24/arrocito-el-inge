// src/routes/complements.routes.js
const express = require('express');
const {
  getAllComplements,
  getComplementById,
  createComplement,
  updateComplement,
  deleteComplement,
} = require('../controllers/complements.controller');
const {
  authRequired,
  roleRequired,
} = require('../middleware/auth.middleware');

const router = express.Router();

// Listar complementos
// GET /api/complements
router.get('/', getAllComplements);

// Obtener complemento por id
// GET /api/complements/:id
router.get('/:id', getComplementById);

// Crear complemento
// POST /api/complements
router.post('/', authRequired, roleRequired('admin'), createComplement);

// Actualizar complemento
// PUT /api/complements/:id
router.put('/:id', authRequired, roleRequired('admin'), updateComplement);

// Desactivar complemento
// DELETE /api/complements/:id
router.delete('/:id', authRequired, roleRequired('admin'), deleteComplement);

module.exports = router;
