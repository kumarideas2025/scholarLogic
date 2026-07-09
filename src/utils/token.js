import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';

/**
 * Token Utilities
 *
 * Centralizes JWT generation/verification and secure random token generation.
 * Access tokens are short-lived; refresh tokens support rotation.
 */

/**
 * Generate a signed JWT.
 * @param {Object} payload - Data to embed in the token
 * @param {('access'|'refresh')} type - Token type
 * @returns {string} Signed JWT
 */
export const generateToken = (payload, type = 'access') => {
  const secret = type === 'access' ? config.accessTokenSecret : config.refreshTokenSecret;
  const expiresIn = type === 'access' ? config.accessTokenExpiry : config.refreshTokenExpiry;
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verify a JWT and return its decoded payload.
 * @param {string} token
 * @param {('access'|'refresh')} type
 * @returns {Object} Decoded payload
 * @throws {Error} If invalid/expired
 */
export const verifyToken = (token, type = 'access') => {
  const secret = type === 'access' ? config.accessTokenSecret : config.refreshTokenSecret;
  return jwt.verify(token, secret);
};

/**
 * Generate a cryptographically secure random token (hex).
 * Used for email verification and password reset.
 * @param {number} bytes - Number of random bytes (default 32)
 * @returns {string} Hex-encoded token
 */
export const generateRandomToken = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

/**
 * Hash a token using SHA-256 for secure storage.
 * Stored hashes cannot be reversed if the DB is compromised.
 * @param {string} token
 * @returns {string} SHA-256 hash (hex)
 */
export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export default { generateToken, verifyToken, generateRandomToken, hashToken };