import mongoose from 'mongoose';
import { COURSE_STATUS, ROLES } from '../constants/index.js';

/**
 * Course Model
 *
 * Represents a course created by a teacher/admin. Uses a text index for
 * keyword search, and references subjects/students via ObjectId arrays.
 *
 * Indexes:
 * - text index (title, description, tags) for full-text search
 * - compound index (status, createdAt) for published-course feeds
 */

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 200 },
    slug: { type: String, unique: true, lowercase: true, index: true },
    description: { type: String, required: [true, 'Description is required'], maxlength: 5000 },
    thumbnail: { type: String, default: '' },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', index: true },
    status: { type: String, enum: Object.values(COURSE_STATUS), default: COURSE_STATUS.DRAFT },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    tags: { type: [String], default: [], index: true },
    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    price: { type: Number, default: 0, min: 0 },
    durationHours: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

courseSchema.index({ title: 'text', description: 'text', tags: 'text' });
courseSchema.index({ status: 1, createdAt: -1 });

// Auto-generate slug from title before save
courseSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  this.isPublished = this.status === COURSE_STATUS.PUBLISHED;
  next();
});

const Course = mongoose.model('Course', courseSchema);

export default Course;