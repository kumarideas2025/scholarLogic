import compression from 'compression';

/**
 * enableCompression - Middleware for gzip compression
 *
 * Reduces payload size for text-based responses (JSON, HTML, CSS, JS)
 * by 60-80%, improving network performance and reducing latency.
 *
 * Security: Compression is safe over HTTPS; never log compressed bodies.
 * Scalability: Lower bandwidth usage; CPU cost is minimal for typical payloads.
 *
 * @returns {Function} Express middleware
 */
const enableCompression = () =>
  compression({
    threshold: 1024, // Only compress responses > 1KB
    level: 6, // Balanced compression level
    filter: (req, res) => {
      // Skip HEAD requests and responses flagged with x-no-compression
      if (req.method === 'HEAD' || req.headers['x-no-compression']) return false;
      // Only compress JSON and text content types
      const contentType = res.getHeader('Content-Type') || '';
      return (
        contentType.includes('application/json') || contentType.includes('text/')
      );
    },
  });

export default enableCompression;