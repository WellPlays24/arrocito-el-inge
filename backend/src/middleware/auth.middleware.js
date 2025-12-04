// src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Verifica que el usuario esté autenticado
function authRequired(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Guardar info del usuario
    req.user = {
      id: decoded.id,
      role: decoded.role,
      name: decoded.name,
      email: decoded.email,
    };

    next();
  } catch (error) {
    console.error('JWT error:', error);
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

// Middleware para validar roles (ej: admin)
function roleRequired(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    next();
  };
}

const verifyAdmin = roleRequired('admin');

module.exports = {
  authRequired,
  roleRequired,
  verifyAdmin,
};
