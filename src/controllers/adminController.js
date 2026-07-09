import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import adminService from '../services/adminService.js';

/**
 * Admin Controller — dashboard analytics & activity logs
 */

export const getDashboard = asyncHandler(async (req, res) => {
  const stats = await adminService.getDashboardStats();
  ApiResponse.success('Dashboard stats retrieved', { stats }).send(res);
});

export const getActivityLogs = asyncHandler(async (req, res) => {
  const { logs, metadata } = await adminService.getActivityLogs(req.query);
  ApiResponse.success('Activity logs retrieved', { logs }, metadata).send(res);
});

export default { getDashboard, getActivityLogs };