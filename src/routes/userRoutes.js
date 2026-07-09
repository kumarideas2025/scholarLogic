import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAccount,
  listUsers,
  adminUpdateUser,
  adminDeleteUser,
} from '../controllers/userController.js';
import { validate } from '../middlewares/validate.js';
import { RequireAuth, RequireRole } from '../middlewares/auth.js';
import { uploadImage } from '../middlewares/upload.js';
import { updateProfileSchema, adminUpdateUserSchema } from '../validators/userValidators.js';

/**
 * User Routes — /api/v1/users
 *
 * Self-service: profile, update, avatar, delete own account.
 * Admin: list, update role/status, delete any user.
 */
const router = Router();

// Self
router.get('/me', RequireAuth, getProfile);
router.patch('/me', RequireAuth, validate(updateProfileSchema), updateProfile);
router.post('/me/avatar', RequireAuth, uploadImage, uploadAvatar);
router.delete('/me', RequireAuth, deleteAccount);

// Admin
router.get('/', RequireAuth, RequireRole('admin'), listUsers);
router.patch('/:userId', RequireAuth, RequireRole('admin'), validate(adminUpdateUserSchema), adminUpdateUser);
router.delete('/:userId', RequireAuth, RequireRole('admin'), adminDeleteUser);

export default router;