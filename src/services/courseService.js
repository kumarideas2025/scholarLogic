import Course from '../models/Course.js';
import ApiError from '../utils/ApiError.js';
import { getPaginationMetadata } from '../utils/pagination.js';
import { QueryBuilder } from '../utils/queryBuilder.js';
import logger from '../utils/logger.js';

/**
 * Course Service
 *
 * CRUD + search for courses. Teachers can manage their own; admins manage all.
 * Search uses MongoDB text index when a keyword is provided, falling back to
 * filtered queries otherwise.
 */

const sanitizeCourse = (c) => ({
  id: c._id?.toString?.() || c._id,
  title: c.title,
  slug: c.slug,
  description: c.description,
  thumbnail: c.thumbnail,
  instructor: c.instructor,
  subject: c.subject,
  status: c.status,
  level: c.level,
  tags: c.tags,
  enrolledStudents: c.enrolledStudents?.length || 0,
  price: c.price,
  durationHours: c.durationHours,
  rating: c.rating,
  isPublished: c.isPublished,
  createdAt: c.createdAt,
  updatedAt: c.updatedAt,
});

export const createCourse = async (data, instructorId) => {
  const course = await Course.create({ ...data, instructor: instructorId });
  logger.info('Course created', { courseId: course._id, instructorId });
  return sanitizeCourse(course);
};

export const getCourses = async (query = {}) => {
  const qb = new QueryBuilder(Course.find(), query, {
    filterFields: ['status', 'level', 'tags'],
    searchFields: ['title', 'description', 'tags'],
    defaultSort: '-createdAt',
    populate: { path: 'instructor', select: 'firstName lastName avatar' },
  });
  const { docs, metadata } = await qb.filter().search().sort().paginate().execWithCount(Course);
  return { courses: docs.map(sanitizeCourse), metadata };
};

export const getCourseById = async (id) => {
  const course = await Course.findById(id).populate('instructor', 'firstName lastName avatar bio');
  if (!course) throw ApiError.notFound('Course not found', 'COURSE_NOT_FOUND');
  return sanitizeCourse(course);
};

export const updateCourse = async (id, data, userId, userRole) => {
  const course = await Course.findById(id);
  if (!course) throw ApiError.notFound('Course not found', 'COURSE_NOT_FOUND');

  // Authorization: only instructor or admin
  if (userRole !== 'admin' && course.instructor.toString() !== userId) {
    throw ApiError.forbidden('Not allowed to update this course', 'COURSE_FORBIDDEN');
  }

  Object.assign(course, data);
  await course.save();
  return sanitizeCourse(course);
};

export const deleteCourse = async (id, userId, userRole) => {
  const course = await Course.findById(id);
  if (!course) throw ApiError.notFound('Course not found', 'COURSE_NOT_FOUND');

  if (userRole !== 'admin' && course.instructor.toString() !== userId) {
    throw ApiError.forbidden('Not allowed to delete this course', 'COURSE_FORBIDDEN');
  }
  await course.deleteOne();
  logger.info('Course deleted', { courseId: id, by: userId });
  return { success: true };
};

export const enrollStudent = async (courseId, studentId) => {
  const course = await Course.findById(courseId);
  if (!course) throw ApiError.notFound('Course not found', 'COURSE_NOT_FOUND');
  if (!course.enrolledStudents.includes(studentId)) {
    course.enrolledStudents.push(studentId);
    await course.save();
  }
  return { success: true, enrolled: course.enrolledStudents.length };
};

export default {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollStudent,
};