import mongoose from 'mongoose';
import { ASSIGNMENT_STATUS } from '../constants/index.js';

/**
 * Assignment Model
 *
 * Belongs to a subject/course, set by a teacher. Supports due dates, points,
 * attachments (references File model), and student submissions.
 */

const submissionSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, default: '' },
    attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    submittedAt: { type: Date, default: Date.now },
    grade: { type: Number, default: null },
    feedback: { type: String, default: '' },
    gradedAt: { type: Date, default: null },
  },
  { _id: true }
);

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 200 },
    description: { type: String, maxlength: 3000, default: '' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', index: true, required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: Object.values(ASSIGNMENT_STATUS), default: ASSIGNMENT_STATUS.OPEN },
    dueDate: { type: Date, required: [true, 'Due date is required'] },
    points: { type: Number, default: 100, min: 0 },
    attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    submissions: [submissionSchema],
  },
  { timestamps: true }
);

assignmentSchema.index({ course: 1, subject: 1, dueDate: -1 });

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;