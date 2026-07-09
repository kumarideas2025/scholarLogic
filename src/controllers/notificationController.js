import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import notificationService from '../services/notificationService.js';
import { RequireAuth } from '../middlewares/auth.js';

/**
 * Notification Controller
 */

export const getNotifications = asyncHandler(async (req, res) => {
  const { notifications, metadata } = await notificationService.getNotifications(req.user.id, req.query);
  ApiResponse.success('Notifications retrieved', { notifications }, metadata).send(res);
});

export const markRead = asyncHandler(async (req, res) => {
  const notif = await notificationService.markRead(req.params.id, req.user.id);
  ApiResponse.success('Notification marked read', { notification: notif }).send(res);
});

export const markAllRead = asyncHandler(async (req, res) => {
  await notificationService.markAllRead(req.user.id);
  ApiResponse.success('All notifications marked read').send(res);
});

export const deleteNotification = asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(req.params.id, req.user.id);
  ApiResponse.success('Notification deleted').send(res);
});

export default { getNotifications, markRead, markAllRead, deleteNotification };