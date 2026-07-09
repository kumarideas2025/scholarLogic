import request from 'supertest';
import createApp from '../app.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { generateToken } from '../utils/token.js';
import { describeDb } from './setup.js';

/**
 * Notification & Admin Integration Tests
 */

const app = createApp();
const USERS = '/api/v1/users';
const NOTIF = '/api/v1/notifications';
const ADMIN = '/api/v1/admin';
const AUTH = '/api/v1/auth';

const signup = async (overrides = {}) => {
  const user = {
    firstName: 'Note',
    lastName: 'User',
    email: `note${Math.floor(Math.random() * 1e6)}@example.com`,
    password: 'Passw0rd!23',
    ...overrides,
  };
  const res = await request(app).post(`${AUTH}/register`).send(user);
  return res.body.data;
};

describeDb('Notification & Admin API', () => {
  it('user can list notifications (starts empty)', async () => {
    const u = await signup();
    const res = await request(app).get(NOTIF).set('Authorization', `Bearer ${u.accessToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data.notifications)).toBe(true);
    expect(res.body.metadata.unreadCount).toBe(0);
  });

  it('marking a notification read works after one exists', async () => {
    const u = await signup();
    // Seed a notification directly
    const notif = await Notification.create({
      recipient: u.user.id,
      type: 'info',
      title: 'Welcome',
      message: 'Hello',
    });
    const res = await request(app)
      .patch(`${NOTIF}/${notif._id}/read`)
      .set('Authorization', `Bearer ${u.accessToken}`);
    expect(res.statusCode).toBe(200);
    const updated = await Notification.findById(notif._id);
    expect(updated.read).toBe(true);
  });

  it('non-admin cannot access admin dashboard (403)', async () => {
    const u = await signup();
    const res = await request(app).get(`${ADMIN}/dashboard`).set('Authorization', `Bearer ${u.accessToken}`);
    expect(res.statusCode).toBe(403);
  });

  it('admin can access dashboard', async () => {
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'Boss',
      email: `admin${Math.floor(Math.random() * 1e6)}@example.com`,
      password: 'Passw0rd!23',
      role: 'admin',
      status: 'active',
      isEmailVerified: true,
    });
    const token = generateToken(
      { sub: admin._id.toString(), role: 'admin', email: admin.email },
      'access'
    );
    const res = await request(app).get(`${ADMIN}/dashboard`).set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.stats).toBeDefined();
  });
});
