import 'dotenv/config';
import startServer from './server.js';

/**
 * Application Entry Point
 *
 * Imports the server bootstrap and starts the application. Keeping this file
 * minimal ensures test harnesses can import the app without side effects.
 */

startServer();