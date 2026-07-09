import dotenv from 'dotenv';

dotenv.config();

/**
 * Central configuration object.
 *
 * All environment variables are validated and coerced here so the rest of the
 * application can import a typed, guaranteed-present config. Missing required
 * variables throw at boot — failing fast is safer than running misconfigured.
 */

const requiredVars = [
  'PORT',
  'NODE_ENV',
  'MONGODB_URI',
  'ACCESS_TOKEN_SECRET',
  'ACCESS_TOKEN_EXPIRY',
  'REFRESH_TOKEN_SECRET',
  'REFRESH_TOKEN_EXPIRY',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_PASS',
  'EMAIL_FROM',
  'CLIENT_URL',
  'CORS_ORIGIN',
  'COOKIE_SECRET',
];

const missing = requiredVars.filter((v) => !process.env[v]);
if (missing.length > 0 && process.env.NODE_ENV !== 'test') {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL,
  corsOrigin: process.env.CORS_ORIGIN,

  mongoUri: process.env.MONGODB_URI,

  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM,
  },

  cookieSecret: process.env.COOKIE_SECRET,
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },

  geminiApiKey: process.env.GEMINI_API_KEY || '',
};

export default config;