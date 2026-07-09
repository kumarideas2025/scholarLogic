/**
 * ApiResponse - Standardized API Response Class
 *
 * This class ensures consistent response formatting across all API endpoints.
 * It wraps successful responses with a standardized structure.
 *
 * Design Rationale:
 * - Consistent response structure simplifies frontend development
 * - Metadata supports pagination, filtering, and other query parameters
 * - Success flag allows quick client-side response validation
 *
 * Security Considerations:
 * - Never include sensitive data in responses
 * - Sanitize all data before including in responses
 * - Use consistent field naming to prevent client confusion
 *
 * Scalability:
 * - Optional metadata supports various response types
 * - Can be extended for different response formats (CSV, etc.)
 */

class ApiResponse {
  /**
   * Creates an ApiResponse instance
   * @param {number} statusCode - HTTP status code (200, 201, 204, etc.)
   * @param {string} message - Success message
   * @param {Object|Array} data - Response data
   * @param {Object} metadata - Additional metadata (pagination, etc.)
   */
  constructor(statusCode, message, data = null, metadata = null) {
    this.statusCode = statusCode;
    this.success = statusCode >= 200 && statusCode < 300;
    this.message = message;
    this.data = data;
    this.metadata = metadata;
  }

  /**
   * Creates a success response (200)
   */
  static success(message = 'Success', data = null, metadata = null) {
    return new ApiResponse(200, message, data, metadata);
  }

  /**
   * Creates a created response (201)
   */
  static created(message = 'Resource Created', data = null, metadata = null) {
    return new ApiResponse(201, message, data, metadata);
  }

  /**
   * Creates a no content response (204)
   */
  static noContent(message = 'No Content') {
    return new ApiResponse(204, message, null, null);
  }

  /**
   * Converts response to JSON format for Express
   */
  toJSON() {
    const response = {
      success: this.success,
      message: this.message
    };

    // Only include data if it exists
    if (this.data !== null) {
      response.data = this.data;
    }

    // Only include metadata if it exists
    if (this.metadata !== null) {
      response.metadata = this.metadata;
    }

    return response;
  }

  /**
   * Sends the response via Express response object
   * @param {Object} res - Express response object
   */
  send(res) {
    return res.status(this.statusCode).json(this.toJSON());
  }
}

export default ApiResponse;