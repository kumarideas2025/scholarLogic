import createApp from './app.js';
import { connectDB, disconnectDB } from './config/database.js';
import config from './config/index.js';
import logger from './utils/logger.js';

/**
 * Server Bootstrap
 *
 * Connects to the database, starts the HTTP server, and registers
 * graceful shutdown handlers for zero-downtime deployments.
 */
const startServer = async () => {
  try {
    await connectDB();

    const app = createApp();
    const server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`, {
        environment: config.nodeEnv,
        clientUrl: config.clientUrl,
      });
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`Received ${signal}, shutting down gracefully`);
      server.close(async () => {
        await disconnectDB();
        logger.info('Process terminated');
        process.exit(0);
      });

      // Force shutdown if connections don't close in time
      setTimeout(() => {
        logger.error('Could not close connections in time, forcing shutdown');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
};

export default startServer;