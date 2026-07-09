import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import config from './config/index.js';
import enableCompression from './middlewares/compression.js';
import requestLogger from './middlewares/requestLogger.js';
import { baseLimiter } from './middlewares/rateLimiter.js';
import sanitize from './middlewares/sanitize.js';
import errorHandler from './middlewares/errorHandler.js';
import notFound from './middlewares/notFound.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import { subjectRouter, assignmentRouter, resourceRouter } from './routes/contentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import setupApiDocs from './docs/apiDocs.js';
import ApiResponse from './utils/ApiResponse.js';
import logger from './utils/logger.js';

/**
 * Express App Factory
 *
 * Assembles the middleware stack in the correct order:
 * security → parsing → logging → sanitization → routes → error handling.
 *
 * Separation of app.js (configuration) and server.js (boot) allows testing
 * the app without binding to a port.
 */

const createApp = () => {
  const app = express();

  // --- Security headers ---
  app.use(helmet());
  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true, // Allow cookies cross-origin
    })
  );

  // --- Parsing ---
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser(config.cookieSecret));

  // --- Compression & logging ---
  app.use(enableCompression());
  if (config.nodeEnv !== 'test') {
    app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
  }
  app.use(requestLogger);

  // --- Rate limiting & sanitization ---
  app.use(baseLimiter);
  app.use(sanitize);

  // --- Health check ---
  app.get('/health', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbHealthy = dbState === 1; // 1 = connected
    const status = dbHealthy ? 200 : 503;
    ApiResponse.success(
      dbHealthy ? 'Server is healthy' : 'Server degraded: database unavailable',
      { database: dbHealthy ? 'connected' : 'disconnected' }
    ).send(res.status(status));
  });

  // --- API routes (mounted incrementally per module) ---
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/courses', courseRoutes);
  app.use('/api/v1/subjects', subjectRouter);
  app.use('/api/v1/assignments', assignmentRouter);
  app.use('/api/v1/resources', resourceRouter);
  app.use('/api/v1/notifications', notificationRoutes);
  app.use('/api/v1/admin', adminRoutes);

  // --- API documentation ---
  setupApiDocs(app);

  // --- 404 & error handling ---
  app.use(notFound);
  app.use(errorHandler);

  return app;
};

export default createApp;