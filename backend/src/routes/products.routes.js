// src/routes/products.routes.js
const express = require('express');
const { getAllProducts,getAllProductsAdmin, getProductById,
        createProduct,  updateProduct,  deleteProduct } = require('../controllers/products.controller');
const {  authRequired,  roleRequired} = require('../middleware/auth.middleware');

const router = express.Router();

// Listar todos los productos (por defecto solo activos)
// GET /api/products
router.get('/', getAllProducts);

// Obtener un producto por id
// GET /api/products/:id
router.get('/:id', getProductById);

// ADMIN: puede ver todo, requiere token + rol admin
router.get('/admin/list',authRequired,roleRequired('admin'),getAllProductsAdmin);

// Crear un nuevo producto
// POST /api/products
router.post('/', authRequired, roleRequired('admin'), createProduct);


// Actualizar un producto
// PUT /api/products/:id
router.put('/:id', authRequired, roleRequired('admin'), updateProduct);


// Desactivar (soft delete) un producto
// DELETE /api/products/:id
router.delete('/:id', authRequired, roleRequired('admin'), deleteProduct);


module.exports = router;
