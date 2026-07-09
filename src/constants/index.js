/**
 * Application Constants
 *
 * Centralized enums and configuration values used across modules.
 * Keeping them here avoids magic strings and makes role/status changes
 * a single-file edit.
 */

export const ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
};

export const ROLE_LIST = Object.values(ROLES);

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
};

export const TOKEN_TYPE = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  EMAIL_VERIFICATION: 'email_verification',
  PASSWORD_RESET: 'password_reset',
};

export const COURSE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

export const ASSIGNMENT_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  GRADED: 'graded',
};

export const NOTIFICATION_TYPE = {
  INFO: 'info',
  WARNING: 'warning',
  SUCCESS: 'success',
  ERROR: 'error',
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

export default {
  ROLES,
  ROLE_LIST,
  USER_STATUS,
  TOKEN_TYPE,
  COURSE_STATUS,
  ASSIGNMENT_STATUS,
  NOTIFICATION_TYPE,
  PAGINATION,
};