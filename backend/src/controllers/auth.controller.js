// src/controllers/auth.controller.js
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { validarCedula } = require('../../../shared/validators/validateCedula');
const { validarNombre } = require('../../../shared/validators/validateName');


function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } // Por defecto 7 días
  );
}


// POST /api/auth/register  (solo clientes)
async function register(req, res, next) {
  try {
    const { name, phone, email, password, cedula, date_of_birth } = req.body;

    if (cedula && !validarCedula(cedula)) {
      const error = new Error('La cédula no es válida');
      error.status = 400;
      throw error;
    }

    // Validación de Nombre Real
    if (name && !validarNombre(name)) {
      const error = new Error('El nombre debe contener al menos nombre y apellido (ej: "Juan Perez") y solo letras.');
      error.status = 400;
      throw error;
    }

    if (!name || !email || !password) {
      const error = new Error('Faltan campos obligatorios');
      error.status = 400;
      throw error;
    }

    const exists = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (exists.rowCount > 0) {
      const error = new Error('El email ya está registrado');
      error.status = 400;
      throw error;
    }

    if (cedula) {
      const cedulaRes = await db.query(
        'SELECT id FROM users WHERE cedula = $1',
        [cedula]
      );
      if (cedulaRes.rowCount > 0) {
        const error = new Error('La cédula ya está registrada');
        error.status = 400;
        throw error;
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

    // Log customer self-registration
    try {
      await db.query(
        `INSERT INTO customer_management_logs (customer_id, action_type, performed_by, performed_by_name, performed_by_role, changes_made, log_date)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
        [user.id, 'created', user.id, user.name, 'client', JSON.stringify({ type: 'self_registration', email: user.email })]
      );
    } catch (logError) {
      console.error('Error recording customer log:', logError);
    }

    const token = generateToken(user);

    return res.status(201).json({
      message: 'Usuario registrado correctamente',
      token,
      user,
    });
  } catch (error) {
    next(error);
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

    // Record login log
    try {
      await db.query(
        `INSERT INTO login_logs (user_id, user_name, user_role, login_date)
                 VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
        [user.id, user.name, user.role]
      );
    } catch (logError) {
      console.error('Error recording login log:', logError);
      // Don't fail login if log recording fails
    }

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

// GET /api/login-logs - Get all login logs (admin only)
async function getLoginLogs(req, res) {
  try {
    const { startDate, endDate } = req.query;

    let query = `
      SELECT 
        ll.id,
        ll.user_name,
        ll.user_role,
        ll.login_date,
        ll.user_id
      FROM login_logs ll
    `;

    const params = [];
    const conditions = [];

    if (startDate) {
      conditions.push(`ll.login_date >= $${params.length + 1}::date`);
      params.push(startDate);
    }

    if (endDate) {
      conditions.push(`ll.login_date < ($${params.length + 1}::date + interval '1 day')`);
      params.push(endDate);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY ll.login_date DESC LIMIT 200';

    const result = await db.query(query, params);

    return res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener logs de login:', error);
    return res.status(500).json({ message: 'Error al obtener logs' });
  }
}

// GET /api/login-logs/user/:userId - Get login logs for specific user (admin only)
async function getLoginLogsByUser(req, res) {
  try {
    const { userId } = req.params;

    const result = await db.query(`
            SELECT 
                ll.id,
                ll.user_name,
                ll.user_role,
                ll.login_date
            FROM login_logs ll
            WHERE ll.user_id = $1
            ORDER BY ll.login_date DESC
        `, [userId]);

    return res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener logs de usuario:', error);
    return res.status(500).json({ message: 'Error al obtener logs' });
  }
}


module.exports = {
  register,
  login,
  me,
  getLoginLogs,
  getLoginLogsByUser,
};
