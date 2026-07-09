/**
 * ApiError - Custom Error Class for API Error Handling
 *
 * This class provides a standardized way to handle errors across the application.
 * It includes HTTP status codes, error messages, and additional metadata.
 *
 * Security Considerations:
 * - Never expose stack traces to clients in production
 * - Use generic error messages for sensitive operations
 * - Log detailed errors server-side for debugging
 *
 * Scalability:
 * - Error codes allow for consistent error handling across services
 * - Status codes follow HTTP standards for REST API compliance
 */

class ApiError extends Error {
  /**
   * Creates an ApiError instance
   * @param {number} statusCode - HTTP status code (e.g., 400, 401, 404, 500)
   * @param {string} message - Error message to display
   * @param {string} errorCode - Custom error code for identification
   * @param {boolean} isOperational - Whether this is an operational error (vs programming error)
   * @param {Object} details - Additional error details for debugging
   */
  constructor(
    statusCode = 500,
    message = 'Internal Server Error',
    errorCode = 'INTERNAL_ERROR',
    isOperational = true,
    details = null
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.details = details;

    // Capture stack trace (excluding constructor from stack)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // Set name for better error identification
    this.name = 'ApiError';
  }

  /**
   * Creates a bad request error (400)
   */
  static badRequest(message = 'Bad Request', errorCode = 'BAD_REQUEST', details = null) {
    return new ApiError(400, message, errorCode, true, details);
  }

  /**
   * Creates an unauthorized error (401)
   */
  static unauthorized(message = 'Unauthorized', errorCode = 'UNAUTHORIZED', details = null) {
    return new ApiError(401, message, errorCode, true, details);
  }

  /**
   * Creates a forbidden error (403)
   */
  static forbidden(message = 'Forbidden', errorCode = 'FORBIDDEN', details = null) {
    return new ApiError(403, message, errorCode, true, details);
  }

  /**
   * Creates a not found error (404)
   */
  static notFound(message = 'Resource Not Found', errorCode = 'NOT_FOUND', details = null) {
    return new ApiError(404, message, errorCode, true, details);
  }

  /**
   * Creates a validation error (422)
   */
  static validation(message = 'Validation Error', errorCode = 'VALIDATION_ERROR', details = null) {
    return new ApiError(422, message, errorCode, true, details);
  }

  /**
   * Creates a conflict error (409)
   */
  static conflict(message = 'Conflict', errorCode = 'CONFLICT', details = null) {
    return new ApiError(409, message, errorCode, true, details);
  }

  /**
   * Creates an internal server error (500)
   */
  static internal(message = 'Internal Server Error', errorCode = 'INTERNAL_ERROR', details = null) {
    return new ApiError(500, message, errorCode, false, details);
  }

  /**
   * Converts error to JSON response format
   */
  toJSON() {
    return {
      success: false,
      message: this.message,
      errorCode: this.errorCode,
      ...(this.details && { details }),
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
    };
  }
}

export default ApiError;