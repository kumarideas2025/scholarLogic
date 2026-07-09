import logger from '../utils/logger.js';

/**
 * Input Sanitization Middleware
 *
 * Recursively strips dangerous characters and known XSS vectors from string
 * inputs in body, query, and params. Prevents NoSQL injection (e.g.
 * {"$gt": ""}) and basic XSS. Validation with Zod runs afterwards for strict
 * typing.
 */

const DANGEROUS_KEYS = ['$where', '$gt', '$lt', '$ne', '$regex', '$exists', 'constructor', '__proto__'];
const XSS_PATTERN = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(XSS_PATTERN, '').replace(/javascript:/gi, '');
};

const sanitizeValue = (value) => {
  if (typeof value === 'string') return sanitizeString(value);
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === 'object') return sanitizeObject(value);
  return value;
};

const sanitizeObject = (obj) => {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (DANGEROUS_KEYS.includes(key)) {
      logger.warn('Sanitizer removed dangerous key', { key });
      continue;
    }
    result[key] = sanitizeValue(value);
  }
  return result;
};

const sanitize = (req, res, next) => {
  if (req.body && typeof req.body === 'object') req.body = sanitizeObject(req.body);
  if (req.query && typeof req.query === 'object') req.query = sanitizeObject(req.query);
  if (req.params && typeof req.params === 'object') req.params = sanitizeObject(req.params);
  next();
};

export default sanitize;