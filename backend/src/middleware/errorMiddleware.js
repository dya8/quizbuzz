const logger = require('../utils/logger');

/**
 * ─── GLOBAL ERROR HANDLER ────────────────────────────────────────────────────
 * Catches all unhandled errors and returns clean JSON responses
 * Must be the LAST middleware registered in app.js
 */
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  // ── Mongoose: Duplicate Key Error ──
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`,
    });
  }

  // ── Mongoose: CastError (invalid ObjectId) ──
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // ── Mongoose: Validation Error ──
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  // ── JWT: Invalid Token ──
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Please login again.',
    });
  }

  // ── JWT: Expired Token ──
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired. Please login again.',
    });
  }

  // ── Multer: File too large ──
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'File size exceeds the allowed limit.',
    });
  }

  // ── Development: Send full error stack ──
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  }

  // ── Production: Hide internal errors ──
  return res.status(err.statusCode).json({
    success: false,
    message: err.statusCode === 500 ? 'Something went wrong. Try again later.' : err.message,
  });
};

/**
 * ─── 404 NOT FOUND HANDLER ───────────────────────────────────────────────────
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = { globalErrorHandler, notFoundHandler };