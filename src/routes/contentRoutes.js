import { Router } from 'express';
import {
  createSubject,
  getSubjects,
  createAssignment,
  getAssignments,
  submitAssignment,
  gradeSubmission,
  updateAssignment,
  deleteAssignment,
  createResource,
  getResources,
  updateResource,
  deleteResource,
} from '../controllers/contentController.js';
import { RequireAuth, RequireRole } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createSubjectSchema, createAssignmentSchema, createResourceSchema } from '../validators/commonValidators.js';

/**
 * Content Routes — /api/v1/subjects, /api/v1/assignments, /api/v1/resources
 *
 * Mounted under separate paths for clean REST naming.
 */

// Subjects
const subjectRouter = Router();
subjectRouter.post('/', RequireAuth, RequireRole('teacher', 'admin'), validate(createSubjectSchema), createSubject);
subjectRouter.get('/', getSubjects);

// Assignments
const assignmentRouter = Router();
assignmentRouter.post('/', RequireAuth, RequireRole('teacher', 'admin'), validate(createAssignmentSchema), createAssignment);
assignmentRouter.get('/', RequireAuth, getAssignments);
assignmentRouter.post('/:id/submit', RequireAuth, RequireRole('student'), submitAssignment);
assignmentRouter.post('/:id/grade/:studentId', RequireAuth, RequireRole('teacher', 'admin'), gradeSubmission);
assignmentRouter.patch('/:id', RequireAuth, RequireRole('teacher', 'admin'), updateAssignment);
assignmentRouter.delete('/:id', RequireAuth, RequireRole('teacher', 'admin'), deleteAssignment);

// Resources
const resourceRouter = Router();
resourceRouter.post('/', RequireAuth, validate(createResourceSchema), createResource);
resourceRouter.get('/', RequireAuth, getResources);
resourceRouter.patch('/:id', RequireAuth, updateResource);
resourceRouter.delete('/:id', RequireAuth, deleteResource);

export { subjectRouter, assignmentRouter, resourceRouter };