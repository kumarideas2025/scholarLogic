import { Router } from 'express';
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enroll,
} from '../controllers/courseController.js';
import { validate } from '../middlewares/validate.js';
import { RequireAuth, RequireRole } from '../middlewares/auth.js';
import { createCourseSchema, updateCourseSchema, queryCourseSchema } from '../validators/courseValidators.js';

/**
 * Course Routes — /api/v1/courses
 */

// Enrollment must be declared before '/:id' to avoid route shadowing
const router = Router();

router.get('/', validate(queryCourseSchema, 'query'), getCourses);
router.post('/', RequireAuth, RequireRole('teacher', 'admin'), validate(createCourseSchema), createCourse);
router.get('/:id', getCourseById);
router.patch('/:id', RequireAuth, RequireRole('teacher', 'admin'), validate(updateCourseSchema), updateCourse);
router.delete('/:id', RequireAuth, RequireRole('teacher', 'admin'), deleteCourse);
router.post('/:id/enroll', RequireAuth, RequireRole('student'), enroll);

export default router;