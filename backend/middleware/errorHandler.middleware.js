// ============================================
// errorHandler.middleware.js — Global Error Handler
// Catches all errors and returns standard API format
// ============================================

const errorHandler = (err, req, res, next) => {
    console.error(`[ERROR] ${new Date().toISOString()} — ${req.method} ${req.originalUrl}`);
    console.error(err.stack || err.message);

    const statusCode = err.statusCode || err.status || 500;

    return res.status(statusCode).json({
        success: false,
        data: null,
        message: err.message || 'Internal Server Error',
        timestamp: new Date().toISOString()
    });
};

/**
 * notFound — 404 handler for unmatched routes.
 * Mount this BEFORE errorHandler.
 */
const notFound = (req, res, next) => {
    // Browsers auto-request favicon.ico — silently ignore it
    if (req.originalUrl === '/favicon.ico') return res.status(204).end();
    const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
    err.statusCode = 404;
    next(err);
};

module.exports = { errorHandler, notFound };
