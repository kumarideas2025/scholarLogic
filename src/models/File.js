import mongoose from 'mongoose';

/**
 * File Model
 *
 * Metadata for uploaded files (Cloudinary or other storage). Storing metadata
 * separately from resources/assignments lets files be reused and audited.
 */

const fileSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, default: '' }, // Cloudinary public ID for deletion
    mimeType: { type: String, required: true },
    size: { type: Number, default: 0 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resourceType: { type: String, enum: ['image', 'video', 'raw', 'auto'], default: 'auto' },
  },
  { timestamps: true }
);

const File = mongoose.model('File', fileSchema);

export default File;