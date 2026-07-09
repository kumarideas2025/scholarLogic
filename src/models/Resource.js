import mongoose from 'mongoose';

/**
 * Resource Model
 *
 * Learning resources (documents, links, videos) attached to courses/subjects.
 * Files are stored via the File model; this tracks metadata and visibility.
 */

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 200 },
    description: { type: String, maxlength: 1000, default: '' },
    type: { type: String, enum: ['document', 'video', 'link', 'slides'], default: 'document' },
    url: { type: String, default: '' },
    file: { type: mongoose.Schema.Types.ObjectId, ref: 'File', default: null },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', index: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', index: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isPublic: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

resourceSchema.index({ course: 1, subject: 1, createdAt: -1 });
resourceSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Resource = mongoose.model('Resource', resourceSchema);

export default Resource;