const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
    // Log del error con Winston
    logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

    const status = err.status || 500;
    const message = err.message || 'Error interno del servidor';

    res.status(status).json({
        message,
        // En desarrollo podrías querer ver el stack, en producción no
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
}

module.exports = errorHandler;
