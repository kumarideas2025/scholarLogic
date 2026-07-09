import { z } from 'zod';
import { ASSIGNMENT_STATUS } from '../constants/index.js';

/**
 * Shared/Common Validators
 */

export const mongoIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

export const createSubjectSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().max(20).optional(),
  description: z.string().max(1000).optional(),
  course: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  parent: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  icon: z.string().max(200).optional(),
  order: z.number().min(0).optional(),
});

export const createAssignmentSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(3000).optional(),
  course: z.string().regex(/^[0-9a-fA-F]{24}$/),
  subject: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  dueDate: z.coerce.date(),
  points: z.number().min(0).max(1000).optional().default(100),
  status: z.enum(Object.values(ASSIGNMENT_STATUS)).optional().default(ASSIGNMENT_STATUS.OPEN),
});

export const createResourceSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
  type: z.enum(['document', 'video', 'link', 'slides']).optional().default('document'),
  url: z.string().url().optional(),
  course: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  subject: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  isPublic: z.boolean().optional().default(false),
  tags: z.array(z.string()).max(20).optional().default([]),
});

export default { mongoIdSchema, createSubjectSchema, createAssignmentSchema, createResourceSchema };