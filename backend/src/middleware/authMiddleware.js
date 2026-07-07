const User = require('../models/User');
const { verifyAccessToken } = require('../utils/jwtUtils');
const { sendError } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * ─── PROTECT MIDDLEWARE ──────────────────────────────────────────────────────
 * Verifies JWT access token and attaches user to req.user
 * Required before any role-specific middleware
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 401, 'Access denied. No token provided.');
    }

    // Verify token
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return sendError(res, 401, 'Invalid or expired token. Please login again.');
    }

    // Check if user still exists
    const user = await User.findById(decoded.id).select('+passwordChangedAt');
    if (!user) {
      return sendError(res, 401, 'User no longer exists.');
    }

    // Check if user is still active
    if (!user.isActive) {
      return sendError(res, 401, 'Your account has been deactivated. Contact support.');
    }

    // Check if password was changed after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return sendError(res, 401, 'Password recently changed. Please login again.');
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    return sendError(res, 500, 'Authentication error.');
  }
};

/**
 * ─── TEACHER MIDDLEWARE ───────────────────────────────────────────────────────
 * Restricts access to teacher role only
 * Must be used AFTER protect middleware
 */
const isTeacher = (req, res, next) => {
  if (req.user.role !== 'teacher') {
    return sendError(
      res,
      403,
      'Access denied. This route is restricted to teachers only.'
    );
  }
  next();
};

/**
 * ─── STUDENT MIDDLEWARE ───────────────────────────────────────────────────────
 * Restricts access to student role only
 * Must be used AFTER protect middleware
 */
const isStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return sendError(
      res,
      403,
      'Access denied. This route is restricted to students only.'
    );
  }
  next();
};

/**
 * ─── ROLE-BASED ACCESS CONTROL ───────────────────────────────────────────────
 * Flexible role check — pass any roles as arguments
 * Usage: restrictTo('teacher', 'admin')
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Access denied. Required role: ${roles.join(' or ')}.`
      );
    }
    next();
  };
};

module.exports = { protect, isTeacher, isStudent, restrictTo };