import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

/**
 * Global Error Handler
 *
 * Express error-handling middleware (must have 4 args). Catches ApiError
 * instances, Mongoose errors, JWT errors, and unknown errors, returning a
 * standardized JSON response. Stack traces are only exposed in development.
 */

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err;

  // If not an ApiError, convert known error types
  if (!(error instanceof ApiError)) {
    let statusCode = 500;
    let errorCode = 'INTERNAL_ERROR';

    if (error.name === 'ValidationError') {
      statusCode = 422;
      errorCode = 'MONGOOSE_VALIDATION_ERROR';
    } else if (error.name === 'CastError') {
      statusCode = 400;
      errorCode = 'INVALID_ID';
    } else if (error.code === 11000) {
      statusCode = 409;
      errorCode = 'DUPLICATE_KEY';
    } else if (error.name === 'JsonWebTokenError') {
      statusCode = 401;
      errorCode = 'INVALID_TOKEN';
    } else if (error.name === 'TokenExpiredError') {
      statusCode = 401;
      errorCode = 'TOKEN_EXPIRED';
    }

    error = new ApiError(statusCode, error.message || 'Internal Server Error', errorCode, false);
  }

  const response = {
    success: false,
    message: error.message,
    errorCode: error.errorCode,
  };

  // Only include details/stack in non-production
  if (process.env.NODE_ENV !== 'production') {
    if (error.details) response.details = error.details;
    response.stack = error.stack;
  }

  logger.error('Request failed', {
    method: req.method,
    path: req.path,
    statusCode: error.statusCode,
    errorCode: error.errorCode,
    message: error.message,
  });

  res.status(error.statusCode).json(response);
};

export default errorHandler;