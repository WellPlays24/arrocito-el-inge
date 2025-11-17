// src/controllers/health.controller.js

function healthCheck(req, res) {
  return res.json({
    status: 'ok',
    message: 'Backend de arroz con pollo funcionando 🐔🍚'
  });
}

module.exports = {
  healthCheck,
};
