import { Router } from 'express';
import { getDashboard, getActivityLogs } from '../controllers/adminController.js';
import { RequireAuth, RequireRole } from '../middlewares/auth.js';

/**
 * Admin Routes — /api/v1/admin
 *
 * Restricted to 'admin' role. Provides dashboard analytics and activity logs.
 */

const router = Router();

router.use(RequireAuth, RequireRole('admin'));
router.get('/dashboard', getDashboard);
router.get('/activity-logs', getActivityLogs);

export default router;