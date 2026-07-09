import { z } from 'zod';
import { COURSE_STATUS } from '../constants/index.js';

/**
 * Course Validators (Zod)
 */

export const createCourseSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  subject: z.string().optional(), // ObjectId as string
  status: z.enum(Object.values(COURSE_STATUS)).optional().default(COURSE_STATUS.DRAFT),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional().default('beginner'),
  tags: z.array(z.string()).max(20).optional().default([]),
  price: z.number().min(0).optional().default(0),
  durationHours: z.number().min(0).optional().default(0),
});

export const updateCourseSchema = createCourseSchema.partial();

export const queryCourseSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(Object.values(COURSE_STATUS)).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'title', 'rating', 'price']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  tags: z.string().optional(), // comma-separated
});

export default { createCourseSchema, updateCourseSchema, queryCourseSchema };