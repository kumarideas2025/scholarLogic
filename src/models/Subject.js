import mongoose from 'mongoose';

/**
 * Subject Model
 *
 * A subject belongs to a course (or stands alone) and groups assignments.
 * Optional parent reference supports a subject hierarchy.
 */

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 100 },
    code: { type: String, trim: true, uppercase: true, unique: true, sparse: true },
    description: { type: String, maxlength: 1000, default: '' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', index: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null },
    icon: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

subjectSchema.index({ course: 1, order: 1 });

const Subject = mongoose.model('Subject', subjectSchema);

export default Subject;