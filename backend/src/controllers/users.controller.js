// src/controllers/users.controller.js
const db = require('../db');
const bcrypt = require('bcryptjs');

const { validarCedula } = require('../utils/validateCedula');


// GET /api/users  -> listar usuarios (sin password_hash)
async function getAllUsers(req, res) {
  try {
    const result = await db.query(
      `SELECT id, name, phone, email, role, cedula, date_of_birth, created_at, updated_at
       FROM users
       ORDER BY id`
    );
    return res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return res.status(500).json({ message: 'Error al obtener usuarios' });
  }
}

// GET /api/users/:id  -> obtener usuario por id
async function getUserById(req, res) {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT id, name, phone, email, role, cedula, date_of_birth, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return res.status(500).json({ message: 'Error al obtener usuario' });
  }
}

// POST /api/users  -> crear usuario (pensado para administración)
// Body:
// {
//   "name": "Ronald",
//   "phone": "0999999999",
//   "email": "ronald@example.com",
//   "password": "123456",
//   "role": "client" | "admin"
// }
async function createUser(req, res) {
  try {
    const { name, phone, email, password, role, cedula, date_of_birth } = req.body;

    if (cedula && !validarCedula(cedula)) {
      return res.status(400).json({ message: 'Cédula ecuatoriana inválida' });
    }

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: 'name, email, password y role son obligatorios',
      });
    }

    if (!['client', 'admin'].includes(role)) {
      return res
        .status(400)
        .json({ message: "role debe ser 'client' o 'admin'" });
    }

    // ¿email ya existe?
    const existing = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existing.rowCount > 0) {
      return res.status(400).json({ message: 'Ya existe un usuario con ese email' });
    }

    // Si envías cédula, comprobamos que no esté repetida
    if (cedula) {
      const cedulaRes = await db.query(
        'SELECT id FROM users WHERE cedula = $1',
        [cedula]
      );
      if (cedulaRes.rowCount > 0) {
        return res.status(400).json({ message: 'Ya existe un usuario con esa cédula' });
      }
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const result = await db.query(
      `INSERT INTO users (name, phone, email, password_hash, role, cedula, date_of_birth)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, phone, email, role, cedula, date_of_birth, created_at, updated_at`,
      [name, phone || null, email, passwordHash, role, cedula || null, date_of_birth || null]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return res.status(500).json({ message: 'Error al crear usuario' });
  }
}

// PUT /api/users/:id  -> actualizar datos de usuario (opcionalmente password)
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, phone, password, role, cedula, date_of_birth } = req.body;

    if (cedula && !validarCedula(cedula)) {
      return res.status(400).json({ message: 'Cédula ecuatoriana inválida' });
    }

    const userRes = await db.query(
      'SELECT id, password_hash FROM users WHERE id = $1',
      [id]
    );

    if (userRes.rowCount === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const currentUser = userRes.rows[0];

    let newPasswordHash = currentUser.password_hash;

    if (password && password.trim() !== '') {
      const saltRounds = 10;
      newPasswordHash = await bcrypt.hash(password, saltRounds);
    }

    let newRole = role;
    if (newRole && !['client', 'admin'].includes(newRole)) {
      return res
        .status(400)
        .json({ message: "role debe ser 'client' o 'admin'" });
    }

    // Validar cédula si se envía
    if (cedula) {
      const cedulaRes = await db.query(
        'SELECT id FROM users WHERE cedula = $1 AND id <> $2',
        [cedula, id]
      );
      if (cedulaRes.rowCount > 0) {
        return res.status(400).json({ message: 'Ya existe un usuario con esa cédula' });
      }
    }

    const result = await db.query(
      `UPDATE users
       SET
         name = COALESCE($1, name),
         phone = COALESCE($2, phone),
         password_hash = $3,
         role = COALESCE($4, role),
         cedula = COALESCE($5, cedula),
         date_of_birth = COALESCE($6, date_of_birth),
         updated_at = NOW()
       WHERE id = $7
       RETURNING id, name, phone, email, role, cedula, date_of_birth, created_at, updated_at`,
      [
        name || null,
        phone || null,
        newPasswordHash,
        newRole || null,
        cedula || null,
        date_of_birth || null,
        id,
      ]
    );

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return res.status(500).json({ message: 'Error al actualizar usuario' });
  }
}


// DELETE /api/users/:id  -> eliminar usuario (físico, OJO con FKs)
async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    // Si el usuario tiene pedidos o deudas, esta eliminación podría fallar por FK
    const result = await db.query(
      'DELETE FROM users WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return res.status(500).json({ message: 'Error al eliminar usuario' });
  }
}

// GET /api/users/debtors
// Retorna usuarios que tienen pedidos pendientes de pago (status != 'completed' AND status != 'cancelled')
async function getDebtors(req, res) {
  try {
    const result = await db.query(
      `
      SELECT
        u.id,
        u.name,
        u.phone,
        u.email,
        COUNT(o.id) AS pending_orders_count,
        COALESCE(SUM(o.total_amount), 0) AS total_debt
      FROM users u
      JOIN orders o ON o.user_id = u.id
      WHERE o.status NOT IN ('completed', 'cancelled')
      GROUP BY u.id, u.name, u.phone, u.email
      ORDER BY total_debt DESC
      `
    );

    return res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener deudores:', error);
    return res.status(500).json({ message: 'Error al obtener deudores' });
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getDebtors,
};
