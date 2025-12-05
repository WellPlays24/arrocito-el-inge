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

// Admin: Grant history
router.get('/grants/history', verifyAdmin, rouletteController.getGrantHistory);
router.get('/grants/user/:userId', verifyAdmin, rouletteController.getGrantHistoryByUser);

// Admin: Spin logs
router.get('/logs', verifyAdmin, rouletteController.getSpinLogs);
router.get('/logs/user/:userId', verifyAdmin, rouletteController.getSpinLogsByUser);

// Prize management - GET is public for clients to see prizes, others are admin-only
router.get('/prizes', rouletteController.getPrizes); // All users can see prizes
router.post('/prizes', verifyAdmin, rouletteController.createPrize);
router.put('/prizes/:id', verifyAdmin, rouletteController.updatePrize);
router.delete('/prizes/:id', verifyAdmin, rouletteController.deletePrize);

module.exports = router;
