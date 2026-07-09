import { z } from 'zod';
import { ROLES, USER_STATUS } from '../constants/index.js';

/**
 * User Validators (Zod)
 */

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
});

export const adminUpdateUserSchema = z.object({
  role: z.enum(Object.values(ROLES)).optional(),
  status: z.enum(Object.values(USER_STATUS)).optional(),
});

export default { updateProfileSchema, adminUpdateUserSchema };