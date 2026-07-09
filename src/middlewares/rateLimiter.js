import rateLimit from 'express-rate-limit';
import config from '../config/index.js';
import logger from '../utils/logger.js';

/**
 * Rate Limiter
 *
 * Protects against brute-force and DoS by limiting requests per IP.
 * In production with a proxy, trust the X-Forwarded-For header.
 */

const baseLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', { ip: req.ip, path: req.path });
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
      errorCode: 'RATE_LIMIT_EXCEEDED',
    });
  },
});

// Stricter limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    errorCode: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
});

export { baseLimiter, authLimiter };
export default baseLimiter;