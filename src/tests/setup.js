/**
 * Jest Global Setup
 *
 * DB-backed integration tests need a MongoDB. Availability is decided
 * SYNCHRONOUSLY at module load so test files can choose `describe` vs
 * `describe.skip` without awaiting:
 *   - If MONGODB_URI is set (CI / Render / local Atlas) → connect to it.
 *   - Else try the in-memory server ONLY if its binary is already cached
 *     locally (no network download — that would hang in restricted sandboxes).
 *
 * If no DB is reachable, `dbDescribe` becomes `describe.skip` and suites are
 * skipped cleanly rather than timing out, so `npm test` always exits
 * deterministically. Pure unit tests (e.g. utils) never touch the DB.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;

function memoryServerBinaryCached() {
  const cacheDir = path.join(os.homedir(), '.cache', 'mongodb-memory-server');
  if (!fs.existsSync(cacheDir)) return false;
  let found = false;
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.startsWith('mongod')) found = true;
    }
  };
  try {
    walk(cacheDir);
  } catch {
    return false;
  }
  return found;
}

// Synchronous availability decision.
export const DB_AVAILABLE = Boolean(uri) || memoryServerBinaryCached();

let mongoServer = null;

export async function setup() {
  if (!DB_AVAILABLE) return; // nothing to do; suites will be skipped
  if (uri) {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    return;
  }
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { serverSelectionTimeoutMS: 8000 });
}

export async function teardown() {
  await mongoose.disconnect().catch(() => {});
  if (mongoServer) await mongoServer.stop().catch(() => {});
}

export async function clearDatabase() {
  if (!DB_AVAILABLE || mongoose.connection.readyState !== 1) return;
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

// describeDb runs the suite only when a database is reachable.
export const describeDb = DB_AVAILABLE ? describe : describe.skip;

beforeAll(async () => {
  await setup();
});

afterAll(async () => {
  await teardown();
});

afterEach(async () => {
  await clearDatabase();
});
