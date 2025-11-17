// src/controllers/auth.controller.js
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { validarCedula } = require('../utils/validateCedula');


function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
}

// POST /api/auth/register  (solo clientes)
async function register(req, res) {
  try {
    const { name, phone, email, password, cedula, date_of_birth } = req.body;

    if (cedula && !validarCedula(cedula)) {
  return res.status(400).json({ message: 'La cédula no es válida' });
}

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    const exists = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (exists.rowCount > 0) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    if (cedula) {
      const cedulaRes = await db.query(
        'SELECT id FROM users WHERE cedula = $1',
        [cedula]
      );
      if (cedulaRes.rowCount > 0) {
        return res.status(400).json({ message: 'La cédula ya está registrada' });
      }
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await db.query(
      `
      INSERT INTO users (name, phone, email, password_hash, role, cedula, date_of_birth)
      VALUES ($1, $2, $3, $4, 'client', $5, $6)
      RETURNING id, name, phone, email, role, cedula, date_of_birth, created_at
      `,
      [name, phone || null, email, hashed, cedula || null, date_of_birth || null]
    );

    const user = result.rows[0];

    const token = generateToken(user);

    return res.status(201).json({
      message: 'Usuario registrado correctamente',
      token,
      user,
    });
  } catch (error) {
    console.error('Error register:', error);
    return res.status(500).json({ message: 'Error al registrar usuario' });
  }
}


// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y password son obligatorios' });
    }

    const userRes = await db.query(
      `SELECT id, name, phone, email, password_hash, role
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (userRes.rowCount === 0) {
      return res.status(400).json({ message: 'Credenciales incorrectas' });
    }

    const user = userRes.rows[0];

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(400).json({ message: 'Credenciales incorrectas' });
    }

    delete user.password_hash;

    const token = generateToken(user);

    return res.json({
      message: 'Login exitoso',
      token,
      user,
    });
  } catch (error) {
    console.error('Error login:', error);
    return res.status(500).json({ message: 'Error al iniciar sesión' });
  }
}

// GET /api/auth/me
async function me(req, res) {
  try {
    const user = await db.query(
      `SELECT id, name, phone, email, role, cedula, date_of_birth, created_at
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    return res.json(user.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener usuario' });
  }
}


module.exports = {
  register,
  login,
  me,
};
