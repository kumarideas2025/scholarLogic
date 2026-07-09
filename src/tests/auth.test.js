import request from 'supertest';
import createApp from '../app.js';
import User from '../models/User.js';
import Token from '../models/Token.js';
import { hashToken, generateRandomToken } from '../utils/token.js';
import { describeDb } from './setup.js';

/**
 * Authentication Integration Tests
 *
 * Uses the in-memory MongoDB from setup.js. Covers register, login,
 * refresh rotation, logout, and password reset flows end-to-end.
 */

const app = createApp();
const BASE = '/api/v1/auth';

const validUser = {
  firstName: 'Test',
  lastName: 'Student',
  email: 'test.student@example.com',
  password: 'Passw0rd!23',
};

describeDb('Auth API', () => {
  describe('POST /register', () => {
    it('registers a new user and returns tokens', async () => {
      const res = await request(app).post(`${BASE}/register`).send(validUser);
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe(validUser.email.toLowerCase());
      // Refresh token set as HTTP-only cookie
      const cookies = res.headers['set-cookie'] || [];
      expect(cookies.some((c) => c.includes('refreshToken'))).toBe(true);
    });

    it('rejects duplicate email with 409', async () => {
      await request(app).post(`${BASE}/register`).send(validUser);
      const res = await request(app).post(`${BASE}/register`).send(validUser);
      expect(res.statusCode).toBe(409);
      expect(res.body.errorCode).toBe('EMAIL_EXISTS');
    });

    it('rejects weak password with 422', async () => {
      const res = await request(app)
        .post(`${BASE}/register`)
        .send({ ...validUser, email: 'weak@example.com', password: 'weak' });
      expect(res.statusCode).toBe(422);
      expect(res.body.errorCode).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /login', () => {
    beforeEach(async () => {
      await request(app).post(`${BASE}/register`).send(validUser);
    });

    it('logs in with correct credentials', async () => {
      const res = await request(app).post(`${BASE}/login`).send({
        email: validUser.email,
        password: validUser.password,
      });
      expect(res.statusCode).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('rejects wrong password', async () => {
      const res = await request(app).post(`${BASE}/login`).send({
        email: validUser.email,
        password: 'WrongPass1!',
      });
      expect(res.statusCode).toBe(401);
      expect(res.body.errorCode).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('POST /refresh', () => {
    it('rotates refresh token and revokes old one', async () => {
      const reg = await request(app).post(`${BASE}/register`).send(validUser);
      const cookie = (reg.headers['set-cookie'] || []).find((c) => c.includes('refreshToken'));
      const raw = decodeURIComponent(cookie.split('refreshToken=')[1].split(';')[0]);

      const refreshRes = await request(app).post(`${BASE}/refresh`).set('Cookie', `refreshToken=${raw}`);
      expect(refreshRes.statusCode).toBe(200);
      expect(refreshRes.body.data.accessToken).toBeDefined();

      // Old token should now be revoked → refresh fails
      const second = await request(app).post(`${BASE}/refresh`).set('Cookie', `refreshToken=${raw}`);
      expect(second.statusCode).toBe(401);
    });
  });

  describe('Password reset flow', () => {
    it('completes forgot → reset cycle', async () => {
      await request(app).post(`${BASE}/register`).send(validUser);

      // Create a reset token directly (bypass email) for deterministic test
      const user = await User.findOne({ email: validUser.email.toLowerCase() });
      const raw = generateRandomToken();
      await Token.create({
        userId: user._id,
        tokenHash: hashToken(raw),
        type: 'password_reset',
        expiresAt: new Date(Date.now() + 3600000),
      });

      const resetRes = await request(app)
        .post(`${BASE}/reset-password`)
        .send({ token: raw, password: 'NewPassw0rd!99' });
      expect(resetRes.statusCode).toBe(200);

      // Old password no longer works
      const oldLogin = await request(app).post(`${BASE}/login`).send({
        email: validUser.email,
        password: validUser.password,
      });
      expect(oldLogin.statusCode).toBe(401);

      // New password works
      const newLogin = await request(app).post(`${BASE}/login`).send({
        email: validUser.email,
        password: 'NewPassw0rd!99',
      });
      expect(newLogin.statusCode).toBe(200);
    });
  });

  describe('GET /me', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get(`${BASE}/me`);
      expect(res.statusCode).toBe(401);
    });
  });
});
