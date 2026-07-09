import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import courseService from '../services/courseService.js';
import { validate } from '../middlewares/validate.js';
import { RequireAuth, RequireRole } from '../middlewares/auth.js';
import { createCourseSchema, updateCourseSchema, queryCourseSchema } from '../validators/courseValidators.js';

/**
 * Course Controller
 */

export const createCourse = asyncHandler(async (req, res) => {
  const course = await courseService.createCourse(req.body, req.user.id);
  ApiResponse.created('Course created', { course }).send(res);
});

export const getCourses = asyncHandler(async (req, res) => {
  const { courses, metadata } = await courseService.getCourses(req.query);
  ApiResponse.success('Courses retrieved', { courses }, metadata).send(res);
});

export const getCourseById = asyncHandler(async (req, res) => {
  const course = await courseService.getCourseById(req.params.id);
  ApiResponse.success('Course retrieved', { course }).send(res);
});

export const updateCourse = asyncHandler(async (req, res) => {
  const course = await courseService.updateCourse(req.params.id, req.body, req.user.id, req.user.role);
  ApiResponse.success('Course updated', { course }).send(res);
});

export const deleteCourse = asyncHandler(async (req, res) => {
  await courseService.deleteCourse(req.params.id, req.user.id, req.user.role);
  ApiResponse.success('Course deleted').send(res);
});

export const enroll = asyncHandler(async (req, res) => {
  const result = await courseService.enrollStudent(req.params.id, req.user.id);
  ApiResponse.success('Enrolled successfully', result).send(res);
});

export default { createCourse, getCourses, getCourseById, updateCourse, deleteCourse, enroll };