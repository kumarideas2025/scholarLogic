import 'dotenv/config';
import connectDB from '../config/database.js';
import User from '../models/User.js';
import config from '../config/index.js';
import logger from '../utils/logger.js';

/**
 * Seed Admin Script
 *
 * Creates the initial admin account from environment variables (or sensible
 * defaults) so the platform has a super-user on first deploy. Idempotent:
 * skips creation if the admin email already exists.
 *
 * Run with: node src/scripts/seedAdmin.js
 */

const seedAdmin = async () => {
  await connectDB();

  const email = (process.env.ADMIN_EMAIL || 'admin@scholarlogic.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

  const existing = await User.findOne({ email });
  if (existing) {
    logger.info('Admin already exists, skipping seed', { email });
    return;
  }

  const admin = await User.create({
    firstName: 'Platform',
    lastName: 'Admin',
    email,
    password,
    role: 'admin',
    status: 'active',
    isEmailVerified: true,
    emailVerifiedAt: new Date(),
  });

  logger.info('Admin seeded successfully', { email, id: admin._id.toString() });
  logger.info('IMPORTANT: change the admin password after first login.');
};

seedAdmin()
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error('Seed failed', { error: err.message });
    process.exit(1);
  });