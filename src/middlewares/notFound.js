import ApiError from '../utils/ApiError.js';

/**
 * 404 Handler
 *
 * Catches requests that don't match any route. Must be registered after
 * all valid routes so it only triggers on unmatched paths.
 */
const notFound = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

export default notFound;