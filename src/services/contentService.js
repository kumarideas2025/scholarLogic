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