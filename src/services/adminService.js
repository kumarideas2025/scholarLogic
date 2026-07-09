import User from '../models/User.js';
import Course from '../models/Course.js';
import Assignment from '../models/Assignment.js';
import ActivityLog from '../models/ActivityLog.js';
import { getPaginationMetadata } from '../utils/pagination.js';

/**
 * Admin Service
 *
 * Aggregates platform-wide analytics and exposes activity logs. Uses MongoDB
 * aggregation for efficient counts grouped by role/status.
 */

export const getDashboardStats = async () => {
  const [
    totalUsers,
    usersByRole,
    totalCourses,
    publishedCourses,
    totalAssignments,
    recentSignups,
  ] = await Promise.all([
    User.countDocuments(),
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    Course.countDocuments(),
    Course.countDocuments({ status: 'published' }),
    Assignment.countDocuments(),
    User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
  ]);

  const roleBreakdown = usersByRole.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {});

  return {
    users: { total: totalUsers, byRole: roleBreakdown, recentSignups },
    courses: { total: totalCourses, published: publishedCourses },
    assignments: { total: totalAssignments },
  };
};

export const getActivityLogs = async (query = {}) => {
  const { page = 1, limit = 25, action, actor } = query;
  const filter = {};
  if (action) filter.action = action;
  if (actor) filter.actor = actor;

  const [logs, total] = await Promise.all([
    ActivityLog.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('actor', 'firstName lastName email role'),
    ActivityLog.countDocuments(filter),
  ]);

  return { logs, metadata: getPaginationMetadata(total, page, limit) };
};

export const recordActivity = async ({ actor, action, entity = '', entityId = null, ip = '', userAgent = '', metadata = {} }) => {
  return ActivityLog.create({ actor, action, entity, entityId, ip, userAgent, metadata });
};

export default { getDashboardStats, getActivityLogs, recordActivity };