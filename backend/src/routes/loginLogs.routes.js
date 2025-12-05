const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authRequired, verifyAdmin } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authRequired);

// Get all login logs (admin only)
router.get('/', verifyAdmin, authController.getLoginLogs);

// Get login logs for specific user (admin only)
router.get('/user/:userId', verifyAdmin, authController.getLoginLogsByUser);

module.exports = router;
