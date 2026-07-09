/**
 * Pagination Utility
 *
 * Generates standardized pagination metadata for list endpoints.
 * Supports page, limit, totalPages, totalItems, nextPage, previousPage.
 *
 * Security: Clamps page/limit to safe bounds to prevent resource exhaustion.
 * Scalability: Consistent metadata across all list endpoints.
 */

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/**
 * Build pagination metadata.
 * @param {number} totalItems - Total number of items matching the query
 * @param {number} page - Current page (1-based)
 * @param {number} limit - Items per page
 * @returns {Object} Pagination metadata object
 */
export const getPaginationMetadata = (totalItems, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) => {
  const safePage = Math.max(1, parseInt(page, 10) || DEFAULT_PAGE);
  const safeLimit = Math.min(MAX_LIMIT, Math.max(1, parseInt(limit, 10) || DEFAULT_LIMIT));
  const totalPages = Math.ceil(totalItems / safeLimit);

  return {
    page: safePage,
    limit: safeLimit,
    totalItems,
    totalPages,
    nextPage: safePage < totalPages ? safePage + 1 : null,
    previousPage: safePage > 1 ? safePage - 1 : null,
    hasNextPage: safePage < totalPages,
    hasPreviousPage: safePage > 1,
  };
};

/**
 * Convert page/limit to Mongoose skip/limit values.
 * @param {number} page
 * @param {number} limit
 * @returns {{skip: number, limit: number}}
 */
export const getPaginationParams = (page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) => {
  const safePage = Math.max(1, parseInt(page, 10) || DEFAULT_PAGE);
  const safeLimit = Math.min(MAX_LIMIT, Math.max(1, parseInt(limit, 10) || DEFAULT_LIMIT));
  return {
    skip: (safePage - 1) * safeLimit,
    limit: safeLimit,
  };
};

export default { getPaginationMetadata, getPaginationParams, DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT };