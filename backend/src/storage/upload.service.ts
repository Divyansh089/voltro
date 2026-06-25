import { CloudinaryService, type CloudinaryFolder } from './cloudinary.service';
import { UPLOAD_DEFAULTS } from '../config/cloudinary';
import { BadRequestError } from '../common/errors';
import { createModuleLogger } from '../config/logger';

const log = createModuleLogger('upload');

/**
 * Upload Service
 *
 * Orchestrates the upload pipeline:
 * 1. Validate file type and size
 * 2. Optimize image (future: Sharp integration)
 * 3. Upload to Cloudinary
 * 4. Return URL
 */
export class UploadService {
  /**
   * Upload a single file.
   */
  static async uploadFile(
    file: Express.Multer.File,
    folder: CloudinaryFolder,
    options?: { publicId?: string }
  ): Promise<{ url: string; publicId: string }> {
    // Validate file type
    if (!UPLOAD_DEFAULTS.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestError(
        `Invalid file type '${file.mimetype}'. Allowed: ${UPLOAD_DEFAULTS.ALLOWED_MIME_TYPES.join(', ')}`
      );
    }

    // Validate file size
    if (file.size > UPLOAD_DEFAULTS.MAX_FILE_SIZE) {
      throw new BadRequestError(
        `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds maximum ${UPLOAD_DEFAULTS.MAX_FILE_SIZE / 1024 / 1024}MB`
      );
    }

    log.info({ filename: file.originalname, size: file.size, folder }, 'Uploading file');

    // Upload to Cloudinary
    const result = await CloudinaryService.uploadBuffer(file.buffer, folder, {
      publicId: options?.publicId,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  /**
   * Upload multiple files.
   */
  static async uploadFiles(
    files: Express.Multer.File[],
    folder: CloudinaryFolder
  ): Promise<Array<{ url: string; publicId: string }>> {
    const results = await Promise.all(
      files.map((file) => UploadService.uploadFile(file, folder))
    );
    return results;
  }

  /**
   * Delete a previously uploaded file.
   */
  static async deleteFile(publicId: string): Promise<void> {
    await CloudinaryService.delete(publicId);
  }
}
