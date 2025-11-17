// src/controllers/complements.controller.js
const db = require('../db');

// GET /api/complements  -> listar complementos
// opcional: ?includeInactive=true  y/o ?type=free|paid
async function getAllComplements(req, res) {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const type = req.query.type; // 'free' o 'paid'

    let sql = `
      SELECT id, name, type, price, is_active, created_at, updated_at
      FROM complements
    `;
    const params = [];
    const conditions = [];

    if (!includeInactive) {
      conditions.push('is_active = TRUE');
    }

    if (type === 'free' || type === 'paid') {
      conditions.push('type = $' + (params.length + 1));
      params.push(type);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY id';

    const result = await db.query(sql, params);
    return res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener complementos:', error);
    return res.status(500).json({ message: 'Error al obtener complementos' });
  }
}

// GET /api/complements/:id  -> obtener un complemento por id
async function getComplementById(req, res) {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT id, name, type, price, is_active, created_at, updated_at
       FROM complements
       WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Complemento no encontrado' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener complemento:', error);
    return res.status(500).json({ message: 'Error al obtener complemento' });
  }
}

// POST /api/complements  -> crear un complemento
async function createComplement(req, res) {
  try {
    const { name, type, price, is_active } = req.body;

    if (!name || !type) {
      return res
        .status(400)
        .json({ message: 'name y type son obligatorios' });
    }

    if (!['free', 'paid'].includes(type)) {
      return res
        .status(400)
        .json({ message: "type debe ser 'free' o 'paid'" });
    }

    const finalPrice = type === 'free' ? 0 : price;

    if (finalPrice == null || finalPrice < 0) {
      return res
        .status(400)
        .json({ message: 'price debe ser mayor o igual a 0' });
    }

    const result = await db.query(
      `INSERT INTO complements (name, type, price, is_active)
       VALUES ($1, $2, $3, COALESCE($4, TRUE))
       RETURNING id, name, type, price, is_active, created_at, updated_at`,
      [name, type, finalPrice, is_active]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear complemento:', error);
    return res.status(500).json({ message: 'Error al crear complemento' });
  }
}

// PUT /api/complements/:id  -> actualizar un complemento
async function updateComplement(req, res) {
  try {
    const { id } = req.params;
    const { name, type, price, is_active } = req.body;

    if (!name || !type) {
      return res
        .status(400)
        .json({ message: 'name y type son obligatorios' });
    }

    if (!['free', 'paid'].includes(type)) {
      return res
        .status(400)
        .json({ message: "type debe ser 'free' o 'paid'" });
    }

    const finalPrice = type === 'free' ? 0 : price;

    if (finalPrice == null || finalPrice < 0) {
      return res
        .status(400)
        .json({ message: 'price debe ser mayor o igual a 0' });
    }

    const result = await db.query(
      `UPDATE complements
       SET name = $1,
           type = $2,
           price = $3,
           is_active = COALESCE($4, is_active),
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, name, type, price, is_active, created_at, updated_at`,
      [name, type, finalPrice, is_active, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Complemento no encontrado' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar complemento:', error);
    return res.status(500).json({ message: 'Error al actualizar complemento' });
  }
}

// DELETE /api/complements/:id  -> desactivar complemento (soft delete)
async function deleteComplement(req, res) {
  try {
    const { id } = req.params;

    const result = await db.query(
      `UPDATE complements
       SET is_active = FALSE,
           updated_at = NOW()
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Complemento no encontrado' });
    }

    return res.json({ message: 'Complemento desactivado correctamente' });
  } catch (error) {
    console.error('Error al desactivar complemento:', error);
    return res.status(500).json({ message: 'Error al desactivar complemento' });
  }
}

module.exports = {
  getAllComplements,
  getComplementById,
  createComplement,
  updateComplement,
  deleteComplement,
};
