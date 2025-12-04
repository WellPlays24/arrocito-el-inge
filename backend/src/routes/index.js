// src/routes/index.js
const express = require('express');

const authRoutes = require('./auth.routes');
const healthRoutes = require('./health.routes');
const productsRoutes = require('./products.routes');
const complementsRoutes = require('./complements.routes');
const creditDebtsRoutes = require('./creditDebts.routes');
const ordersRoutes = require('./orders.routes');
const usersRoutes = require('./users.routes');
const dailyExpensesRoutes = require('./dailyExpenses.routes');
const dailySummaryRoutes = require('./dailySummary.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/products', productsRoutes);
router.use('/complements', complementsRoutes);
router.use('/credit-debts', creditDebtsRoutes);
router.use('/orders', ordersRoutes);
router.use('/users', usersRoutes);
router.use('/daily-expenses', dailyExpensesRoutes);
router.use('/daily-summary', dailySummaryRoutes);
router.use('/roulette', require('./roulette.routes'));




module.exports = router;
