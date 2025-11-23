// src/routes/users.routes.js
const express = require('express');
const {getAllUsers, getUserById,createUser, updateUser, deleteUser} = require('../controllers/users.controller');
const {authRequired, roleRequired} = require('../middleware/auth.middleware');


const router = express.Router();

// Listar usuarios
// GET /api/users
//router.get('/', getAllUsers);
router.get('/', authRequired, roleRequired('admin'), getAllUsers);


// Obtener usuario por id
// GET /api/users/:id
router.get('/:id', authRequired, roleRequired('admin'), getUserById);

// Crear usuario
// POST /api/users
router.post('/', authRequired, roleRequired('admin'), createUser);

// Actualizar usuario
// PUT /api/users/:id
router.put('/:id', authRequired, roleRequired('admin'),updateUser);

// Eliminar usuario
// DELETE /api/users/:id
router.delete('/:id', authRequired, roleRequired('admin'),deleteUser);

module.exports = router;
