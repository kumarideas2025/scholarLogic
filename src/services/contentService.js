import Subject from '../models/Subject.js';
import Assignment from '../models/Assignment.js';
import Resource from '../models/Resource.js';
import ApiError from '../utils/ApiError.js';
import { getPaginationMetadata } from '../utils/pagination.js';
import logger from '../utils/logger.js';

/**
 * Content Service — Subjects, Assignments, Resources
 *
 * Pure CRUD plus assignment submission/grading. Kept together because they
 * share the course/subject context and authorization rules.
 */

// ---------- Subjects ----------
export const createSubject = async (data) => {
  const subject = await Subject.create(data);
  return subject.toObject();
};

export const getSubjects = async (filter = {}) => {
  const subjects = await Subject.find(filter).sort({ order: 1 });
  return subjects;
};

// ---------- Assignments ----------
export const createAssignment = async (data, createdBy) => {
  const assignment = await Assignment.create({ ...data, createdBy });
  return assignment.toObject();
};

export const getAssignments = async (query = {}) => {
  const { page = 1, limit = 10, course, subject, status } = query;
  const filter = {};
  if (course) filter.course = course;
  if (subject) filter.subject = subject;
  if (status) filter.status = status;

  const [assignments, total] = await Promise.all([
    Assignment.find(filter).skip((page - 1) * limit).limit(limit).sort({ dueDate: -1 }),
    Assignment.countDocuments(filter),
  ]);
  return { assignments, metadata: getPaginationMetadata(total, page, limit) };
};

export const submitAssignment = async (assignmentId, studentId, content, attachments = []) => {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw ApiError.notFound('Assignment not found', 'ASSIGNMENT_NOT_FOUND');
  if (assignment.status === 'closed') {
    throw ApiError.badRequest('Assignment is closed', 'ASSIGNMENT_CLOSED');
  }
  const existing = assignment.submissions.find((s) => s.student.toString() === studentId);
  if (existing) {
    existing.content = content;
    existing.attachments = attachments;
    existing.submittedAt = new Date();
  } else {
    assignment.submissions.push({ student: studentId, content, attachments });
  }
  await assignment.save();
  return assignment.toObject();
};

export const gradeSubmission = async (assignmentId, studentId, grade, feedback) => {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw ApiError.notFound('Assignment not found', 'ASSIGNMENT_NOT_FOUND');
  const sub = assignment.submissions.find((s) => s.student.toString() === studentId);
  if (!sub) throw ApiError.notFound('Submission not found', 'SUBMISSION_NOT_FOUND');
  sub.grade = grade;
  sub.feedback = feedback;
  sub.gradedAt = new Date();
  assignment.status = 'graded';
  await assignment.save();
  return assignment.toObject();
};

export const updateAssignment = async (assignmentId, data, userId, userRole) => {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw ApiError.notFound('Assignment not found', 'ASSIGNMENT_NOT_FOUND');
  if (userRole !== 'admin' && assignment.createdBy.toString() !== userId) {
    throw ApiError.forbidden('Not allowed to update this assignment', 'ASSIGNMENT_FORBIDDEN');
  }
  Object.assign(assignment, data);
  await assignment.save();
  return assignment.toObject();
};

export const deleteAssignment = async (assignmentId, userId, userRole) => {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw ApiError.notFound('Assignment not found', 'ASSIGNMENT_NOT_FOUND');
  if (userRole !== 'admin' && assignment.createdBy.toString() !== userId) {
    throw ApiError.forbidden('Not allowed to delete this assignment', 'ASSIGNMENT_FORBIDDEN');
  }
  await assignment.deleteOne();
  return { success: true };
};

// ---------- Resources ----------
export const createResource = async (data, uploadedBy) => {
  const resource = await Resource.create({ ...data, uploadedBy });
  return resource.toObject();
};

export const getResources = async (query = {}) => {
  const { page = 1, limit = 10, course, subject, search, isPublic } = query;
  const filter = {};
  if (course) filter.course = course;
  if (subject) filter.subject = subject;
  if (isPublic !== undefined) filter.isPublic = isPublic;

  let resources, total;
  if (search) {
    resources = await Resource.find({ $text: { $search: search }, ...filter })
      .skip((page - 1) * limit)
      .limit(limit);
    total = await Resource.countDocuments({ $text: { $search: search }, ...filter });
  } else {
    resources = await Resource.find(filter).skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 });
    total = await Resource.countDocuments(filter);
  }
  return { resources, metadata: getPaginationMetadata(total, page, limit) };
};

export const updateResource = async (resourceId, data, userId, userRole) => {
  const resource = await Resource.findById(resourceId);
  if (!resource) throw ApiError.notFound('Resource not found', 'RESOURCE_NOT_FOUND');
  if (userRole !== 'admin' && resource.uploadedBy.toString() !== userId) {
    throw ApiError.forbidden('Not allowed to update this resource', 'RESOURCE_FORBIDDEN');
  }
  Object.assign(resource, data);
  await resource.save();
  return resource.toObject();
};

export const deleteResource = async (resourceId, userId, userRole) => {
  const resource = await Resource.findById(resourceId);
  if (!resource) throw ApiError.notFound('Resource not found', 'RESOURCE_NOT_FOUND');
  if (userRole !== 'admin' && resource.uploadedBy.toString() !== userId) {
    throw ApiError.forbidden('Not allowed to delete this resource', 'RESOURCE_FORBIDDEN');
  }
  // Remove underlying file from storage if one is linked
  if (resource.file) {
    const File = (await import('../models/File.js')).default;
    const fileDoc = await File.findById(resource.file);
    if (fileDoc) {
      const { deleteImage } = await import('../config/cloudinary.js');
      if (fileDoc.publicId) await deleteImage(fileDoc.publicId).catch(() => {});
      await fileDoc.deleteOne();
    }
  }
  await resource.deleteOne();
  return { success: true };
};

export default {
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
};