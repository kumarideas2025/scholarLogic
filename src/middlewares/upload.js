import multer from 'multer';
import ApiError from '../utils/ApiError.js';
import config from '../config/index.js';

/**
 * Upload Middleware (Multer, in-memory)
 *
 * Stores uploads in memory buffers (not disk) so they can be streamed directly
 * to Cloudinary. Limits file size and restricts to images to prevent abuse.
 *
 * Security: Memory limits protect against DoS; MIME + size checks reduce risk
 * of storing malicious payloads. Cloudinary re-validates on upload.
 */

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = (parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 10) * 1024 * 1024;

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return cb(ApiError.badRequest('Only image files are allowed', 'INVALID_FILE_TYPE'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE, files: 1 },
  fileFilter,
});

// Single image field middleware
export const uploadImage = upload.single('avatar');

export default upload;