/**
 * Async Handler - Wrapper for Async Express Routes
 *
 * This utility wraps async route handlers to automatically catch errors
 * and pass them to Express's error handling middleware.
 *
 * Why this exists:
 * - Eliminates the need for try-catch blocks in every async controller
 * - Centralizes error handling logic
 * - Reduces boilerplate code
 * - Ensures consistent error propagation
 *
 * Scalability:
 * - Works with any async function
 * - Compatible with Express middleware chain
 * - Can be extended for specific error handling needs
 *
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;