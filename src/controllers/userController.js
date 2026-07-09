import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import userService from '../services/userService.js';
import upload from '../middlewares/upload.js';
import { RequireAuth, RequireRole } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { updateProfileSchema, adminUpdateUserSchema } from '../validators/userValidators.js';

/**
 * User Controller
 *
 * Thin handlers for profile, avatar, update, delete, and admin user management.
 */

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await userService.getProfile(req.user.id);
  ApiResponse.success('Profile retrieved', { user: profile }).send(res);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const updated = await userService.updateProfile(req.user.id, req.body);
  ApiResponse.success('Profile updated', { user: updated }).send(res);
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new (await import('../utils/ApiError.js')).default(400, 'No image file provided', 'NO_FILE');
  const result = await userService.uploadAvatar(req.user.id, req.file.buffer);
  ApiResponse.success('Avatar uploaded', result).send(res);
});

export const deleteAccount = asyncHandler(async (req, res) => {
  await userService.deleteAccount(req.user.id);
  ApiResponse.success('Account deleted successfully').send(res);
});

// Admin: list users (paginated)
export const listUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role, status, search } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (search) filter.$or = [
    { firstName: { $regex: search, $options: 'i' } },
    { lastName: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const [users, total] = await Promise.all([
    (await import('../models/User.js')).default.find(filter).skip(skip).limit(parseInt(limit, 10)).select('-password'),
    (await import('../models/User.js')).default.countDocuments(filter),
  ]);

  const { getPaginationMetadata } = await import('../utils/pagination.js');
  const metadata = getPaginationMetadata(total, page, limit);
  ApiResponse.success('Users retrieved', { users }, metadata).send(res);
});

export const adminUpdateUser = asyncHandler(async (req, res) => {
  const updated = await userService.adminUpdateUser(req.params.userId, req.body);
  ApiResponse.success('User updated by admin', { user: updated }).send(res);
});

export const adminDeleteUser = asyncHandler(async (req, res) => {
  await userService.deleteAccount(req.params.userId);
  ApiResponse.success('User deleted by admin').send(res);
});

export default {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAccount,
  listUsers,
  adminUpdateUser,
  adminDeleteUser,
};