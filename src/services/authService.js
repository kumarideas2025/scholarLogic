import User from '../models/User.js';
import Token from '../models/Token.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import { generateToken, verifyToken, generateRandomToken, hashToken } from '../utils/token.js';
import { sendEmail } from '../config/mail.js';
import emailTemplates from '../templates/emailTemplates.js';
import config from '../config/index.js';
import { addDays } from '../utils/dateHelpers.js';

/**
 * Auth Service
 *
 * All authentication business logic lives here (controllers stay thin).
 * Handles registration, login, token refresh with rotation, email verification,
 * password reset/change, and logout (single + all devices).
 */

const ACCESS_TTL_MS = parseExpiry(config.accessTokenExpiry);
const REFRESH_TTL_MS = parseExpiry(config.refreshTokenExpiry);
const EMAIL_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const RESET_TTL_MS = 60 * 60 * 1000; // 1h

function parseExpiry(expiry) {
  const match = String(expiry).match(/^(\d+)\s*(s|m|h|d)$/);
  if (!match) return 15 * 60 * 1000;
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return parseInt(match[1], 10) * multipliers[match[2]];
}

const buildAuthResponse = (user) => {
  const accessToken = generateToken(
    { sub: user._id.toString(), role: user.role, email: user.email },
    'access'
  );
  return {
    user: sanitizeUser(user),
    accessToken,
    accessTokenExpiry: ACCESS_TTL_MS,
  };
};

const sanitizeUser = (user) => ({
  id: user._id.toString(),
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  status: user.status,
  avatar: user.avatar,
  isEmailVerified: user.isEmailVerified,
  createdAt: user.createdAt,
});

// --- Register ---
export const register = async ({ firstName, lastName, email, password, role }) => {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw ApiError.conflict('Email already registered', 'EMAIL_EXISTS');
  }

  const user = await User.create({ firstName, lastName, email, password, role });

  // Create email verification token
  const rawToken = generateRandomToken();
  await Token.create({
    userId: user._id,
    tokenHash: hashToken(rawToken),
    type: 'email_verification',
    expiresAt: addDays(new Date(), 1),
    userAgent: '',
    ip: '',
  });

  try {
    await sendEmail({
      to: user.email,
      subject: 'Verify your ScholarLogic email',
      html: emailTemplates.verificationEmail(user.firstName, rawToken),
    });
    await sendEmail({
      to: user.email,
      subject: 'Welcome to ScholarLogic',
      html: emailTemplates.welcomeEmail(user.firstName),
    });
  } catch (err) {
    logger.warn('Failed to send welcome/verification email', { error: err.message });
  }

  // Auto-verify in dev for convenience; in prod, require email click
  if (config.nodeEnv !== 'production') {
    user.isEmailVerified = true;
    user.status = 'active';
    await user.save();
  }

  return buildAuthResponse(user);
};

// --- Login ---
export const login = async ({ email, password }, { userAgent = '', ip = '' } = {}) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) throw ApiError.unauthorized('Invalid credentials', 'INVALID_CREDENTIALS');

  if (user.isLocked && user.isLocked()) {
    throw ApiError.unauthorized('Account temporarily locked. Try again later.', 'ACCOUNT_LOCKED');
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    await user.incrementLoginAttempts();
    throw ApiError.unauthorized('Invalid credentials', 'INVALID_CREDENTIALS');
  }

  await user.resetLoginAttempts();
  user.lastLoginAt = new Date();
  await user.save();

  const response = buildAuthResponse(user);

  // Issue + store refresh token (rotation enabled)
  const refreshToken = await issueRefreshToken(user, userAgent, ip);
  response.refreshToken = refreshToken;

  return response;
};

// --- Issue refresh token (stored hashed) ---
const issueRefreshToken = async (user, userAgent, ip) => {
  const raw = generateRandomToken(40);
  await Token.create({
    userId: user._id,
    tokenHash: hashToken(raw),
    type: 'refresh',
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    userAgent,
    ip,
  });
  return raw;
};

// --- Refresh access token (rotation) ---
export const refreshAccessToken = async (rawRefreshToken, { userAgent = '', ip = '' } = {}) => {
  if (!rawRefreshToken) throw ApiError.unauthorized('Refresh token required', 'NO_REFRESH_TOKEN');

  const hashed = hashToken(rawRefreshToken);
  const stored = await Token.findOne({
    tokenHash: hashed,
    type: 'refresh',
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  });

  if (!stored) throw ApiError.unauthorized('Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');

  // Rotate: revoke old, issue new
  stored.isRevoked = true;
  await stored.save();

  const user = await User.findById(stored.userId);
  if (!user || user.status === 'suspended') {
    throw ApiError.unauthorized('User unavailable', 'USER_UNAVAILABLE');
  }

  const response = buildAuthResponse(user);
  response.refreshToken = await issueRefreshToken(user, userAgent, ip);
  return response;
};

// --- Verify email ---
export const verifyEmail = async (token) => {
  const hashed = hashToken(token);
  const stored = await Token.findOne({
    tokenHash: hashed,
    type: 'email_verification',
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  });
  if (!stored) throw ApiError.badRequest('Invalid or expired verification token', 'INVALID_VERIFICATION_TOKEN');

  const user = await User.findById(stored.userId);
  if (!user) throw ApiError.notFound('User not found', 'USER_NOT_FOUND');

  user.isEmailVerified = true;
  user.emailVerifiedAt = new Date();
  user.status = 'active';
  await user.save();

  stored.isRevoked = true;
  await stored.save();
  return sanitizeUser(user);
};

// --- Forgot password ---
export const forgotPassword = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  // Always return success to avoid user enumeration
  if (!user) {
    logger.info('Forgot password requested for unknown email', { email });
    return { sent: true };
  }

  const rawToken = generateRandomToken();
  await Token.create({
    userId: user._id,
    tokenHash: hashToken(rawToken),
    type: 'password_reset',
    expiresAt: new Date(Date.now() + RESET_TTL_MS),
  });

  try {
    await sendEmail({
      to: user.email,
      subject: 'Reset your ScholarLogic password',
      html: emailTemplates.forgotPasswordEmail(user.firstName, rawToken),
    });
  } catch (err) {
    logger.warn('Failed to send password reset email', { error: err.message });
  }
  return { sent: true };
};

// --- Reset password ---
export const resetPassword = async (token, newPassword) => {
  const hashed = hashToken(token);
  const stored = await Token.findOne({
    tokenHash: hashed,
    type: 'password_reset',
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  });
  if (!stored) throw ApiError.badRequest('Invalid or expired reset token', 'INVALID_RESET_TOKEN');

  const user = await User.findById(stored.userId).select('+password');
  if (!user) throw ApiError.notFound('User not found', 'USER_NOT_FOUND');

  user.password = newPassword;
  user.passwordChangedAt = new Date();
  await user.save();

  stored.isRevoked = true;
  await stored.save();

  // Revoke all refresh tokens (force re-login everywhere)
  await Token.updateMany(
    { userId: user._id, type: 'refresh' },
    { isRevoked: true }
  );

  try {
    await sendEmail({
      to: user.email,
      subject: 'Your password was changed',
      html: emailTemplates.resetSuccessEmail(user.firstName),
    });
  } catch (err) {
    logger.warn('Failed to send reset-success email', { error: err.message });
  }
  return { success: true };
};

// --- Change password (authenticated) ---
export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw ApiError.notFound('User not found', 'USER_NOT_FOUND');

  const valid = await user.comparePassword(currentPassword);
  if (!valid) throw ApiError.badRequest('Current password is incorrect', 'INVALID_CURRENT_PASSWORD');

  user.password = newPassword;
  await user.save();

  // Revoke all other sessions
  await Token.updateMany({ userId, type: 'refresh' }, { isRevoked: true });
  return { success: true };
};

// --- Logout (single device) ---
export const logout = async (rawRefreshToken) => {
  if (!rawRefreshToken) return;
  const hashed = hashToken(rawRefreshToken);
  await Token.updateOne({ tokenHash: hashed, type: 'refresh' }, { isRevoked: true });
};

// --- Logout all devices ---
export const logoutAll = async (userId) => {
  await Token.updateMany({ userId, type: 'refresh' }, { isRevoked: true });
};

export default {
  register,
  login,
  refreshAccessToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  logout,
  logoutAll,
};