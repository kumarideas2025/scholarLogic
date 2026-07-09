import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import { deleteImage, uploadImage } from '../config/cloudinary.js';
import { sendEmail } from '../config/mail.js';
import emailTemplates from '../templates/emailTemplates.js';

/**
 * User Service
 *
 * Profile management: fetch, update, avatar upload, soft-delete (account
 * deletion). Admin can update roles/status of other users.
 */

const sanitizeUser = (user) => ({
  id: user._id.toString(),
  firstName: user.firstName,
  lastName: user.lastName,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  status: user.status,
  avatar: user.avatar,
  bio: user.bio,
  isEmailVerified: user.isEmailVerified,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
  return sanitizeUser(user);
};

export const updateProfile = async (userId, updates) => {
  const allowed = ['firstName', 'lastName', 'bio'];
  const filtered = Object.keys(updates)
    .filter((k) => allowed.includes(k))
    .reduce((obj, k) => ({ ...obj, [k]: updates[k] }), {});

  const user = await User.findByIdAndUpdate(userId, filtered, { new: true, runValidators: true });
  if (!user) throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
  return sanitizeUser(user);
};

export const uploadAvatar = async (userId, fileBuffer) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found', 'USER_NOT_FOUND');

  // Remove old avatar if present
  if (user.avatar) {
    try {
      const publicId = extractPublicId(user.avatar);
      if (publicId) await deleteImage(publicId);
    } catch (err) {
      logger.warn('Failed to delete old avatar', { error: err.message });
    }
  }

  const result = await uploadImage(fileBuffer, { resource_type: 'image', width: 400, height: 400, crop: 'fill' });
  user.avatar = result.secure_url;
  await user.save();
  return { avatar: user.avatar };
};

export const deleteAccount = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found', 'USER_NOT_FOUND');

  // Best-effort: remove avatar from Cloudinary
  if (user.avatar) {
    try {
      const publicId = extractPublicId(user.avatar);
      if (publicId) await deleteImage(publicId);
    } catch (err) {
      logger.warn('Failed to delete avatar on account delete', { error: err.message });
    }
  }

  await User.findByIdAndDelete(userId);
  try {
    await sendEmail({
      to: user.email,
      subject: 'Your ScholarLogic account was deleted',
      html: `<p>Hi ${user.firstName}, your account has been permanently deleted.</p>`,
    });
  } catch (err) {
    logger.warn('Failed to send account-deletion email', { error: err.message });
  }
  return { success: true };
};

// Admin: update role/status
export const adminUpdateUser = async (targetUserId, updates) => {
  const allowed = ['role', 'status'];
  const filtered = Object.keys(updates)
    .filter((k) => allowed.includes(k))
    .reduce((obj, k) => ({ ...obj, [k]: updates[k] }), {});

  const user = await User.findByIdAndUpdate(targetUserId, filtered, { new: true, runValidators: true });
  if (!user) throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
  return sanitizeUser(user);
};

// Helper: extract Cloudinary public ID from a secure URL
const extractPublicId = (url) => {
  const match = url.match(/\/v\d+\/(.+)\.[a-z]+$/i);
  return match ? match[1] : null;
};

export default {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAccount,
  adminUpdateUser,
};