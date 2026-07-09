import config from '../config/index.js';

/**
 * Cookie Options Utility
 *
 * Returns secure, HTTP-only cookie options for auth tokens.
 * SameSite=Strict mitigates CSRF; Secure requires HTTPS in production.
 */

const isProduction = config.nodeEnv === 'production';

export const accessTokenCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'strict',
  maxAge: parseExpiryToMs(config.accessTokenExpiry),
  path: '/api/v1/auth/refresh',
};

export const refreshTokenCookieOptions = {
  httpOnly: true,                // Not accessible via JavaScript
  secure: isProduction,          // HTTPS only in production
  sameSite: 'strict',            // Mitigates CSRF attacks
  maxAge: parseExpiryToMs(config.refreshTokenExpiry),
  path: '/api/v1/auth/refresh',  // Limit cookie scope to refresh endpoint
};

/**
 * Convert a JWT expiry string (e.g. "15m", "7d") to milliseconds.
 * @param {string} expiry
 * @returns {number} milliseconds
 */
function parseExpiryToMs(expiry) {
  if (typeof expiry === 'number') return expiry * 1000;
  const match = String(expiry).match(/^(\d+)\s*(s|m|h|d)$/);
  if (!match) return 15 * 60 * 1000; // default 15m
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
  return value * multipliers[unit];
}

export default { accessTokenCookieOptions, refreshTokenCookieOptions, parseExpiryToMs };