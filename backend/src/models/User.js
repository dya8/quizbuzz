const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * Supports both Teacher and Student roles
 * Passwords are hashed before saving using bcrypt
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never return password in queries by default
    },
    otp: {
  type: String,
  default: null,
},

otpExpires: {
  type: Date,
  default: null,
},
    role: {
      type: String,
      enum: {
        values: ['teacher', 'student'],
        message: 'Role must be either teacher or student',
      },
      required: [true, 'Role is required'],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    passwordChangedAt: {
      type: Date,
      default: null,
    },

    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ─── Indexes ────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// ─── Pre-save Hook: Hash Password ────────────────────────────────────────────
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }
});

// ─── Instance Method: Compare Password ───────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {

 

  const result = await bcrypt.compare(candidatePassword, this.password);

  

  return result;
};

// ─── Instance Method: Check if password changed after JWT issued ─────────────
userSchema.methods.changedPasswordAfter = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return jwtTimestamp < changedTimestamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);
module.exports = User;