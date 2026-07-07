const express = require('express');
const router = express.Router();

const {
  register,
  login,
  refreshToken,
  logout,
  changePassword,

  forgotPassword,
  verifyOtp,
  resetPassword,
} = require("../controllers/authController");
const { protect } = require('../middleware/authMiddleware');

const {
  validateRegister,
  validateLogin,
  validateChangePassword,
} = require('../middleware/validationMiddleware');

/**
 * ─── AUTH ROUTES ─────────────────────────────────────────────────────────────
 *
 * Base: /api/auth
 */

// ── Public Routes ────────────────────────────────────────────────────────────
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/refresh', refreshToken);
router.post("/forgot-password", forgotPassword);

router.post("/verify-otp", verifyOtp);

router.post("/reset-password", resetPassword);
// ── Protected Routes (require valid JWT) ─────────────────────────────────────
router.post('/logout', protect, logout);

router.put('/change-password', protect, validateChangePassword, changePassword);

module.exports = router;