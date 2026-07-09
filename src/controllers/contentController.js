import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import contentService from '../services/contentService.js';
import { RequireAuth, RequireRole } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createSubjectSchema, createAssignmentSchema, createResourceSchema } from '../validators/commonValidators.js';

/**
 * Content Controller — subjects, assignments, resources
 */

export const createSubject = asyncHandler(async (req, res) => {
  const subject = await contentService.createSubject(req.body);
  ApiResponse.created('Subject created', { subject }).send(res);
});

export const getSubjects = asyncHandler(async (req, res) => {
  const { course } = req.query;
  const subjects = await contentService.getSubjects(course ? { course } : {});
  ApiResponse.success('Subjects retrieved', { subjects }).send(res);
});

export const createAssignment = asyncHandler(async (req, res) => {
  const assignment = await contentService.createAssignment(req.body, req.user.id);
  ApiResponse.created('Assignment created', { assignment }).send(res);
});

export const getAssignments = asyncHandler(async (req, res) => {
  const { assignments, metadata } = await contentService.getAssignments(req.query);
  ApiResponse.success('Assignments retrieved', { assignments }, metadata).send(res);
});

export const submitAssignment = asyncHandler(async (req, res) => {
  const result = await contentService.submitAssignment(
    req.params.id,
    req.user.id,
    req.body.content,
    req.body.attachments || []
  );
  ApiResponse.success('Assignment submitted', { assignment: result }).send(res);
});

export const gradeSubmission = asyncHandler(async (req, res) => {
  const result = await contentService.gradeSubmission(
    req.params.id,
    req.params.studentId,
    req.body.grade,
    req.body.feedback
  );
  ApiResponse.success('Submission graded', { assignment: result }).send(res);
});

export const createResource = asyncHandler(async (req, res) => {
  const resource = await contentService.createResource(req.body, req.user.id);
  ApiResponse.created('Resource created', { resource }).send(res);
});

export const getResources = asyncHandler(async (req, res) => {
  const { resources, metadata } = await contentService.getResources(req.query);
  ApiResponse.success('Resources retrieved', { resources }, metadata).send(res);
});

export default {
  createSubject,
  getSubjects,
  createAssignment,
  getAssignments,
  submitAssignment,
  gradeSubmission,
  createResource,
  getResources,
};