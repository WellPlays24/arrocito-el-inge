const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logs.controller');
const { authRequired, verifyAdmin } = require('../middleware/auth.middleware');

// All routes require authentication and admin role
router.use(authRequired);
router.use(verifyAdmin);

// Customer management logs
router.get('/customer-management', logsController.getCustomerManagementLogs);

// Order status logs
router.get('/order-status', logsController.getOrderStatusLogs);

// Order creation logs
router.get('/order-creation', logsController.getOrderCreationLogs);

module.exports = router;
