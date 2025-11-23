
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');
const errorHandler = require('./middleware/error.middleware');
const logger = require('./utils/logger');

const app = express();

app.use(cors());

// Morgan para logs de requests HTTP
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

module.exports = app;
