// src/routes/auth.routes.js
const express = require('express');
const { register, login, me } = require('../controllers/auth.controller');
const { authRequired } = require('../middleware/auth.middleware');

const router = express.Router();

// Registro (solo clientes)
router.post('/register', register);

// Login
router.post('/login', login);

// Usuario autenticado
router.get('/me', authRequired, me);

module.exports = router;

