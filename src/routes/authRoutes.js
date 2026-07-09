import { Router } from 'express';
import {
  register,
  login,
  refresh,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  logout,
  logoutAll,
  getMe,
} from '../controllers/authController.js';
import { validate } from '../middlewares/validate.js';
import { RequireAuth, RequireRole } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailSchema,
} from '../validators/authValidators.js';

/**
 * Auth Routes — /api/v1/auth
 *
 * Public: register, login, refresh, verify-email, forgot/reset password.
 * Protected: change-password, logout, logout-all, me.
 */
const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', refresh);
router.get('/verify-email', validate(verifyEmailSchema, 'query'), verifyEmail);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.post('/change-password', RequireAuth, validate(changePasswordSchema), changePassword);
router.post('/logout', logout);
router.post('/logout-all', RequireAuth, logoutAll);
router.get('/me', RequireAuth, getMe);

// Future: resend verification
// router.post('/resend-verification', RequireAuth, resendVerification);

export default router;