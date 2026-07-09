import request from 'supertest';
import createApp from '../app.js';
import User from '../models/User.js';
import { generateToken } from '../utils/token.js';

/**
 * User Module Integration Tests
 *
 * Verifies profile retrieval, update, and admin user listing.
 */

const app = createApp();
const AUTH = '/api/v1/auth';
const USERS = '/api/v1/users';

const signup = async (overrides = {}) => {
  const user = {
    firstName: 'Jane',
    lastName: 'Doe',
    email: `jane${Math.floor(Math.random() * 1e6)}@example.com`,
    password: 'Passw0rd!23',
    ...overrides,
  };
  const res = await request(app).post(`${AUTH}/register`).send(user);
  return { user, body: res.body };
};

describe('User API', () => {
  it('GET /me returns the authenticated user', async () => {
    const { body } = await signup();
    const token = body.data.accessToken;

    const res = await request(app).get(`${USERS}/me`).set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.email).toBe(body.data.user.email);
  });

  it('PATCH /me updates allowed fields only', async () => {
    const { body } = await signup();
    const token = body.data.accessToken;

    const res = await request(app)
      .patch(`${USERS}/me`)
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Janet', bio: 'Math tutor', role: 'admin' }); // role should be ignored
    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.firstName).toBe('Janet');
    expect(res.body.data.user.bio).toBe('Math tutor');
    expect(res.body.data.user.role).toBe('student'); // unchanged
  });

  it('admin can list users', async () => {
    await signup();
    // Create an admin directly in DB
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: 'Passw0rd!23',
      role: 'admin',
      status: 'active',
      isEmailVerified: true,
    });
    const adminToken = generateToken(
      { sub: admin._id.toString(), role: 'admin', email: admin.email },
      'access'
    );

    const res = await request(app)
      .get(`${USERS}/`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data.users)).toBe(true);
    expect(res.body.metadata.totalItems).toBeGreaterThanOrEqual(1);
  });

  it('non-admin cannot list users', async () => {
    const { body } = await signup();
    const token = body.data.accessToken;
    const res = await request(app).get(`${USERS}/`).set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(403);
  });
});
