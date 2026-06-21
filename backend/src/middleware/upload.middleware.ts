import multer from 'multer';
import { UPLOAD_DEFAULTS } from '../config/cloudinary';

/**
 * Upload Middleware Configuration (Multer)
 *
 * Stores files in memory (buffers) — they're passed to Sharp for
 * optimization and then to Cloudinary for storage.
 * No temp files on disk.
 */
const storage = multer.memoryStorage();

/**
 * File filter — rejects files that aren't allowed image types.
 */
const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (UPLOAD_DEFAULTS.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: ${UPLOAD_DEFAULTS.ALLOWED_MIME_TYPES.join(', ')}`));
  }
};

/**
 * Single image upload middleware.
 * Field name: 'image'
 */
export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: UPLOAD_DEFAULTS.MAX_FILE_SIZE,
  },
}).single('image');

/**
 * Multiple images upload middleware.
 * Field name: 'images', max 10 files.
 */
export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: UPLOAD_DEFAULTS.MAX_FILE_SIZE,
    files: 10,
  },
}).array('images', 10);
