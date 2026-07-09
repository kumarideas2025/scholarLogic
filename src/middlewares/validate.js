import { ZodError } from 'zod';
import ApiError from '../utils/ApiError.js';

/**
 * Validation Middleware Factory
 *
 * Returns an Express middleware that validates req[property] against a Zod
 * schema. Supports 'body', 'query', 'params', and 'headers'.
 *
 * @param {import('zod').ZodSchema} schema - Zod schema
 * @param {('body'|'query'|'params'|'headers')} property - Request part to validate
 */
export const validate = (schema, property = 'body') => (req, res, next) => {
  try {
    const validated = schema.parse(req[property]);
    req[property] = validated; // Replace with sanitized/coerced data
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.errors.map((e) => ({
        field: e.path.join('.') || 'root',
        message: e.message,
      }));
      return next(ApiError.validation('Validation failed', 'VALIDATION_ERROR', details));
    }
    return next(error);
  }
};

export default validate;