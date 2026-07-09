import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';
import { getPaginationMetadata } from '../utils/pagination.js';

/**
 * Notification Service
 *
 * Creates, lists, marks read, and deletes notifications. Supports bulk-create
 * (e.g., notify many students about a new assignment).
 */

export const createNotification = async ({ recipient, type = 'info', title, message, link = '' }) => {
  const notif = await Notification.create({ recipient, type, title, message, link });
  return notif.toObject();
};

export const notifyMany = async (recipients, payload) => {
  const docs = recipients.map((r) => ({ recipient: r, ...payload }));
  return Notification.insertMany(docs);
};

export const getNotifications = async (userId, query = {}) => {
  const { page = 1, limit = 20, unreadOnly } = query;
  const filter = { recipient: userId };
  if (unreadOnly === 'true' || unreadOnly === true) filter.read = false;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }),
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipient: userId, read: false }),
  ]);

  const metadata = getPaginationMetadata(total, page, limit);
  metadata.unreadCount = unreadCount;
  return { notifications, metadata };
};

export const markRead = async (notificationId, userId) => {
  const notif = await Notification.findOne({ _id: notificationId, recipient: userId });
  if (!notif) throw ApiError.notFound('Notification not found', 'NOTIF_NOT_FOUND');
  await notif.markRead();
  return notif.toObject();
};

export const markAllRead = async (userId) => {
  await Notification.updateMany({ recipient: userId, read: false }, { read: true, readAt: new Date() });
  return { success: true };
};

export const deleteNotification = async (notificationId, userId) => {
  const result = await Notification.deleteOne({ _id: notificationId, recipient: userId });
  if (result.deletedCount === 0) throw ApiError.notFound('Notification not found', 'NOTIF_NOT_FOUND');
  return { success: true };
};

export default {
  createNotification,
  notifyMany,
  getNotifications,
  markRead,
  markAllRead,
  deleteNotification,
};