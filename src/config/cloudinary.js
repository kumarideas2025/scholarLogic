import { v2 as cloudinary } from 'cloudinary';
import config from './index.js';
import logger from '../utils/logger.js';

/**
 * Cloudinary Configuration
 *
 * Initializes the Cloudinary SDK from environment variables.
 * Uploads are scoped to a dedicated folder for isolation.
 */

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true,
});

export const uploadImage = (fileBuffer, options = {}) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'scholarlogic', resource_type: 'auto', ...options },
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload failed', { error: error.message });
          return reject(error);
        }
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });

export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info('Cloudinary image deleted', { publicId });
    return result;
  } catch (error) {
    logger.error('Cloudinary delete failed', { error: error.message, publicId });
    throw error;
  }
};

export default cloudinary;