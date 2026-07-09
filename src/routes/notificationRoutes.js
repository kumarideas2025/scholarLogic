import { Router } from 'express';
import {
  getNotifications,
  markRead,
  markAllRead,
  deleteNotification,
} from '../controllers/notificationController.js';
import { RequireAuth } from '../middlewares/auth.js';

/**
 * Notification Routes — /api/v1/notifications
 */

const router = Router();

router.get('/', RequireAuth, getNotifications);
router.post('/read-all', RequireAuth, markAllRead);
router.patch('/:id/read', RequireAuth, markRead);
router.delete('/:id', RequireAuth, deleteNotification);

export default router;