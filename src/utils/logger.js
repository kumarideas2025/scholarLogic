/**
 * Logger Utility
 *
 * Lightweight structured logger. Avoids logging sensitive data (passwords,
 * tokens, emails). In production, swap to Winston/Pino if needed — the
 * interface here is intentionally minimal.
 */

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

const currentLevel = () => {
  const env = process.env.NODE_ENV;
  if (env === 'production') return LEVELS.info;
  if (env === 'test') return LEVELS.error;
  return LEVELS.debug;
};

const shouldLog = (level) => LEVELS[level] <= currentLevel();

const redact = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  const sensitive = ['password', 'token', 'accessToken', 'refreshToken', 'authorization', 'cookie'];
  const clone = Array.isArray(obj) ? [...obj] : { ...obj };
  for (const key of Object.keys(clone)) {
    if (sensitive.includes(key.toLowerCase())) clone[key] = '[REDACTED]';
    else if (typeof clone[key] === 'object') clone[key] = redact(clone[key]);
  }
  return clone;
};

const format = (level, message, meta) => {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta ? { meta: redact(meta) } : {}),
  };
  return JSON.stringify(entry);
};

export const logger = {
  error: (message, meta) => shouldLog('error') && console.error(format('error', message, meta)),
  warn: (message, meta) => shouldLog('warn') && console.warn(format('warn', message, meta)),
  info: (message, meta) => shouldLog('info') && console.info(format('info', message, meta)),
  debug: (message, meta) => shouldLog('debug') && console.debug(format('debug', message, meta)),
};

export default logger;