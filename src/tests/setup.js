/**
 * Jest Global Setup
 *
 * Connects to MongoDB for integration tests. Uses a real `MONGODB_URI` when
 * provided (CI / Render with Atlas), otherwise spins up an in-memory MongoDB
 * via `mongodb-memory-server` (requires network to fetch the binary on first
 * run). Shared helpers wipe collections between tests.
 */

import mongoose from 'mongoose';

let mongoServer = null;

export async function setup() {
  const uri = process.env.MONGODB_URI;
  if (uri) {
    await mongoose.connect(uri);
    return;
  }
  // Lazy-load so environments without the binary don't error at import time.
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
}

export async function teardown() {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
}

export async function clearDatabase() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

beforeAll(async () => {
  await setup();
});

afterAll(async () => {
  await teardown();
});

afterEach(async () => {
  await clearDatabase();
});
