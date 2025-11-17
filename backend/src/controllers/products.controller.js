// src/controllers/products.controller.js
const db = require('../db');

// GET /api/products  -> listar todos los productos (opción de incluir inactivos)
async function getAllProducts(req, res) {
  try {
    const includeInactive = req.query.includeInactive === 'true';

    const sql = includeInactive
      ? 'SELECT id, name, description, price, is_active, image_url, created_at, updated_at FROM products ORDER BY id'
      : 'SELECT id, name, description, price, is_active, image_url, created_at, updated_at FROM products WHERE is_active = TRUE ORDER BY id';

    const result = await db.query(sql);
    return res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return res.status(500).json({ message: 'Error al obtener productos' });
  }
}

// GET /api/products/:id  -> obtener un solo producto por id
async function getProductById(req, res) {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT id, name, description, price, is_active, image_url, created_at, updated_at FROM products WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    return res.status(500).json({ message: 'Error al obtener producto' });
  }
}

// POST /api/products  -> crear un nuevo producto
async function createProduct(req, res) {
  try {
    const { name, description, price, is_active, image_url } = req.body;

    if (!name || price == null) {
      return res.status(400).json({ message: 'name y price son obligatorios' });
    }

    const result = await db.query(
      `INSERT INTO products (name, description, price, is_active, image_url)
       VALUES ($1, $2, $3, COALESCE($4, TRUE), $5)
       RETURNING id, name, description, price, is_active, image_url, created_at, updated_at`,
      [name, description || null, price, is_active, image_url || null]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear producto:', error);
    return res.status(500).json({ message: 'Error al crear producto' });
  }
}

// PUT /api/products/:id  -> actualizar producto completo
async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { name, description, price, is_active, image_url } = req.body;

    // Opcional: validar que no vengan campos obligatorios vacíos
    if (!name || price == null) {
      return res.status(400).json({ message: 'name y price son obligatorios' });
    }

    const result = await db.query(
      `UPDATE products
       SET name = $1,
           description = $2,
           price = $3,
           is_active = COALESCE($4, is_active),
           image_url = $5,
           updated_at = NOW()
       WHERE id = $6
       RETURNING id, name, description, price, is_active, image_url, created_at, updated_at`,
      [name, description || null, price, is_active, image_url || null, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return res.status(500).json({ message: 'Error al actualizar producto' });
  }
}

// DELETE /api/products/:id  -> "eliminar" producto (soft delete: is_active = false)
async function deleteProduct(req, res) {
  try {
    const { id } = req.params;

    const result = await db.query(
      `UPDATE products
       SET is_active = FALSE,
           updated_at = NOW()
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    return res.json({ message: 'Producto desactivado correctamente' });
  } catch (error) {
    console.error('Error al desactivar producto:', error);
    return res.status(500).json({ message: 'Error al desactivar producto' });
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
