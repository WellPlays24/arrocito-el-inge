const express = require('express');
const router = express.Router();
const rouletteController = require('../controllers/roulette.controller');
const { authRequired, verifyAdmin } = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(authRequired);

// Obtener estado (puede girar?)
router.get('/status', rouletteController.getSpinStatus);

// Girar la ruleta
router.post('/spin', rouletteController.spin);

// Admin: Conceder giros extra
router.post('/grant', verifyAdmin, rouletteController.grantSpin);

module.exports = router;
