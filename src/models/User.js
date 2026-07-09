import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import config from '../config/index.js';
import { ROLES, USER_STATUS } from '../constants/index.js';

/**
 * User Model
 *
 * Core identity entity. Uses role-based access (student|teacher|admin) and
 * stores a bcrypt-hashed password. Refresh tokens are NOT stored here (they
 * live in the Token collection to support rotation and multi-device logout).
 *
 * Security:
 * - Passwords hashed with bcrypt (cost factor from config).
 * - Email verified flag gates protected routes.
 * - `loginAttempts`/`lockUntil` provide brute-force protection.
 *
 * Indexes:
 * - Unique email (case-insensitive via collation or lowercase pre-save).
 * - Compound index on role + status for admin dashboards.
 */

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: [true, 'First name is required'], trim: true, maxlength: 50 },
    lastName: { type: String, required: [true, 'Last name is required'], trim: true, maxlength: 50 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false, // Never returned in queries unless explicitly selected
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.STUDENT,
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.PENDING,
    },
    avatar: { type: String, default: '' },
    bio: { type: String, maxlength: 500, default: '' },
    isEmailVerified: { type: Boolean, default: false },
    emailVerifiedAt: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    passwordChangedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// --- Indexes ---
// Note: `email` unique index is declared on the field; `role+status` for admin dashboards.
userSchema.index({ role: 1, status: 1 });

// --- Virtuals ---
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// --- Pre-save hook: hash password ---
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(config.bcryptRounds);
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordChangedAt = new Date();
  next();
});

// --- Instance methods ---
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

userSchema.methods.incrementLoginAttempts = async function () {
  // Lock account after 5 failed attempts for 15 minutes
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.loginAttempts = 1;
    this.lockUntil = null;
  } else {
    this.loginAttempts += 1;
    if (this.loginAttempts >= 5) {
      this.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
  }
  return this.save();
};

userSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.lockUntil = null;
  return this.save();
};

const User = mongoose.model('User', userSchema);

export default User;