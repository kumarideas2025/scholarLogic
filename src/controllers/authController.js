import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import authService from '../services/authService.js';
import { refreshTokenCookieOptions } from '../utils/cookieOptions.js';
import logger from '../utils/logger.js';

/**
 * Auth Controller
 *
 * Thin layer: parses request, calls authService, sets cookies, returns
 * standardized ApiResponse. No business logic here.
 */

const getTokenFromCookies = (req) => req.cookies?.refreshToken || null;

// POST /api/v1/auth/register
export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  ApiResponse.created('Registration successful. Please verify your email.', result).send(res);
});

// POST /api/v1/auth/login
export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body, {
    userAgent: req.get('User-Agent') || '',
    ip: req.ip,
  });

  // Set refresh token as HTTP-only cookie
  res.cookie('refreshToken', result.refreshToken, refreshTokenCookieOptions);
  delete result.refreshToken;

  ApiResponse.success('Login successful', result).send(res);
});

// POST /api/v1/auth/refresh
export const refresh = asyncHandler(async (req, res) => {
  const result = await authService.refreshAccessToken(getTokenFromCookies(req), {
    userAgent: req.get('User-Agent') || '',
    ip: req.ip,
  });

  res.cookie('refreshToken', result.refreshToken, refreshTokenCookieOptions);
  delete result.refreshToken;

  ApiResponse.success('Token refreshed', result).send(res);
});

// GET /api/v1/auth/verify-email?token=...
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;
  const user = await authService.verifyEmail(token);
  ApiResponse.success('Email verified successfully', { user }).send(res);
});

// POST /api/v1/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body);
  // Always return generic message (no enumeration)
  ApiResponse.success('If the email exists, a reset link has been sent.').send(res);
});

// POST /api/v1/auth/reset-password
export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.password);
  ApiResponse.success('Password reset successful. Please log in.').send(res);
});

// POST /api/v1/auth/change-password (auth required)
export const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
  ApiResponse.success('Password changed successfully. Please log in again.').send(res);
});

// POST /api/v1/auth/logout
export const logout = asyncHandler(async (req, res) => {
  await authService.logout(getTokenFromCookies(req));
  res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });
  ApiResponse.success('Logged out successfully').send(res);
});

// POST /api/v1/auth/logout-all (auth required)
export const logoutAll = asyncHandler(async (req, res) => {
  await authService.logoutAll(req.user.id);
  res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });
  ApiResponse.success('Logged out from all devices').send(res);
});

// GET /api/v1/auth/me (auth required)
export const getMe = asyncHandler(async (req, res) => {
  ApiResponse.success('Current user', { user: req.user }).send(res);
});

export default {
  register,
  login,
  refresh,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  logout,
  logoutAll,
  getMe,
};