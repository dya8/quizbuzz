const User = require('../models/User');

const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwtUtils');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * ─── REGISTER ────────────────────────────────────────────────────────────────
 * POST /api/auth/register
 * Public
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 409, 'An account with this email already exists.');
    }

    // Create new user (password hashed via pre-save hook in User model)
    const user = await User.create({ name, email, password, role });

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Store hashed refresh token in DB
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    logger.info(`New user registered: ${email} (${role})`);

    return sendSuccess(res, 201, 'Registration successful.', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    return sendError(res, 500, 'Registration failed. Please try again.');
  }
};

/**
 * ─── LOGIN ────────────────────────────────────────────────────────────────────
 * POST /api/auth/login
 * Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Fetch user with password field (excluded by default)
    const user = await User.findOne({ email }).select('+password +refreshToken');

    if (!user) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    // Check if account is active
    if (!user.isActive) {
      return sendError(res, 401, 'Your account is deactivated. Contact support.');
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    // Generate fresh tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Update refresh token and last login
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    logger.info(`User logged in: ${email}`);

    return sendSuccess(res, 200, 'Login successful.', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    return sendError(res, 500, 'Login failed. Please try again.');
  }
};

/**
 * ─── REFRESH TOKEN ────────────────────────────────────────────────────────────
 * POST /api/auth/refresh
 * Public (uses refresh token)
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return sendError(res, 401, 'Refresh token is required.');
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      return sendError(res, 401, 'Invalid or expired refresh token.');
    }

    // Find user and validate stored token
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      return sendError(res, 401, 'Refresh token is invalid or has been revoked.');
    }

    // Issue new access token
    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    // Rotate refresh token
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return sendSuccess(res, 200, 'Token refreshed.', {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    logger.error(`Token refresh error: ${error.message}`);
    return sendError(res, 500, 'Token refresh failed.');
  }
};

/**
 * ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
 * POST /api/auth/forgot-password
 * Public
 */
const forgotPassword = async (req, res) => {
  try {

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email not registered",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    user.otp = otp;

    user.otpExpires =
      Date.now() + 10 * 60 * 1000;

    await user.save();

    await sendEmail(
      user.email,
      "QuizBuzz Password Reset OTP",
      `Your OTP is ${otp}. It is valid for 10 minutes.`
    );

    res.json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};
/**
 * Verify OTP
 * POST /api/auth/verify-otp
 * Public
 */
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (new Date() > user.otpExpires) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    res.json({
      success: true,
      message: "OTP verified successfully",
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};
/**
 * Reset Password
 * POST /api/auth/reset-password
 * Public
 */
const resetPassword = async (req, res) => {
  try {

    const { email, otp, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (new Date() > user.otpExpires) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

user.password = password;

    // Clear OTP after successful reset
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully",
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};

/**
 * ─── LOGOUT ───────────────────────────────────────────────────────────────────
 * POST /api/auth/logout
 * Protected
 */
const logout = async (req, res) => {
  try {
    // Invalidate refresh token in DB
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

    logger.info(`User logged out: ${req.user.email}`);
    return sendSuccess(res, 200, 'Logged out successfully.');
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    return sendError(res, 500, 'Logout failed.');
  }
};

/**
 * ─── GET PROFILE ─────────────────────────────────────────────────────────────
 * GET /api/auth/profile
 * Protected
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, 404, 'User not found.');
    }
    return sendSuccess(res, 200, 'Profile fetched.', { user });
  } catch (error) {
    logger.error(`Get profile error: ${error.message}`);
    return sendError(res, 500, 'Failed to fetch profile.');
  }
};

/**
 * ─── UPDATE PROFILE ──────────────────────────────────────────────────────────
 * PUT /api/auth/profile
 * Protected
 */
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    // Only allow updating safe fields (not password, role, email via this route)
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name },
      { new: true, runValidators: true }
    );

    return sendSuccess(res, 200, 'Profile updated.', { user: updatedUser });
  } catch (error) {
    logger.error(`Update profile error: ${error.message}`);
    return sendError(res, 500, 'Failed to update profile.');
  }
};

/**
 * ─── CHANGE PASSWORD ─────────────────────────────────────────────────────────
 * PUT /api/auth/change-password
 * Protected
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return sendError(res, 401, 'Current password is incorrect.');
    }

    user.password = newPassword;
    await user.save();

    // Invalidate all existing refresh tokens
    user.refreshToken = null;
    await user.save({ validateBeforeSave: false });

    // Issue new tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    logger.info(`Password changed for user: ${user.email}`);

    return sendSuccess(res, 200, 'Password changed successfully.', {
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error(`Change password error: ${error.message}`);
    return sendError(res, 500, 'Failed to change password.');
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  changePassword,
  forgotPassword,
  verifyOtp,
  resetPassword,
};