import crypto from 'crypto';

// Token generation/hashing lives in utils/token.js to avoid duplication.
export { generateRandomToken, hashToken } from './token.js';

/**
 * Generate a human-friendly temporary password (for admin-created accounts).
 */
export const generateTemporaryPassword = (length = 12) => {
  const charset =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += charset[bytes[i] % charset.length];
  }
  return password;
};

/**
 * Sleep helper for retry/backoff logic.
 */
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default { generateRandomToken, hashToken, generateTemporaryPassword, sleep };