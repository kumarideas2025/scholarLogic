import logger from '../utils/logger.js';

/**
 * Request Logger Middleware
 *
 * Logs every incoming request with method, URL, IP, and response time.
 * Sensitive headers (authorization, cookie) are never logged.
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request', {
      method,
      url: originalUrl,
      ip,
      statusCode: res.statusCode,
      durationMs: duration,
    });
  });

  next();
};

export default requestLogger;