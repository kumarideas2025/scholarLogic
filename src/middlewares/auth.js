import ApiError from '../utils/ApiError.js';
import { verifyToken } from '../utils/token.js';
import config from '../config/index.js';

/**
 * Authentication & Authorization Middleware
 *
 * RequireAuth       - Validates the access token (Bearer or cookie) and attaches req.user
 * RequireRole      - Restricts access to specific roles (student|teacher|admin)
 * RequirePermission - Future-ready permission gates (currently role-based)
 *
 * Design: Authentication is decoupled from authorization so both can evolve
 * independently. Roles are simple strings; permissions are arrays on the user.
 */

export const RequireAuth = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    let token = null;

    if (header && header.startsWith('Bearer ')) {
      token = header.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(ApiError.unauthorized('Authentication required', 'NO_TOKEN'));
    }

    const decoded = verifyToken(token, 'access');
    req.user = { id: decoded.sub, role: decoded.role, email: decoded.email };
    next();
  } catch (error) {
    return next(ApiError.unauthorized('Invalid or expired token', 'INVALID_TOKEN'));
  }
};

export const RequireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required', 'NO_TOKEN'));
  }
  if (!roles.includes(req.user.role)) {
    return next(ApiError.forbidden('Insufficient permissions', 'ROLE_FORBIDDEN'));
  }
  next();
};

export const RequirePermission = (...permissions) => (req, res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required', 'NO_TOKEN'));
  }
  // Future-ready: user.permissions can be set via role expansion service.
  const userPerms = req.user.permissions || [];
  const hasAll = permissions.every((p) => userPerms.includes(p));
  if (!hasAll) {
    return next(ApiError.forbidden('Missing required permission', 'PERMISSION_FORBIDDEN'));
  }
  next();
};

export default { RequireAuth, RequireRole, RequirePermission };