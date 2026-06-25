import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { CLOUDINARY_FOLDERS } from '../config/cloudinary';
import { createModuleLogger } from '../config/logger';

const log = createModuleLogger('cloudinary-service');

export type CloudinaryFolder = typeof CLOUDINARY_FOLDERS[keyof typeof CLOUDINARY_FOLDERS];

/**
 * Cloudinary Service
 *
 * Handles all interactions with Cloudinary:
 * - Upload (buffer or URL)
 * - Delete by public ID
 * - Generate optimized URLs
 */
export class CloudinaryService {
  /**
   * Upload a file buffer to Cloudinary.
   */
  static async uploadBuffer(
    buffer: Buffer,
    folder: CloudinaryFolder,
    options?: {
      publicId?: string;
      transformation?: Record<string, unknown>;
    }
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          format: 'webp',
          quality: 'auto:good',
          ...(options?.publicId && { public_id: options.publicId }),
          ...(options?.transformation && { transformation: options.transformation }),
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            log.error({ error, folder }, 'Cloudinary upload failed');
            reject(new Error(`Cloudinary upload failed: ${error.message}`));
          } else if (result) {
            log.info({ publicId: result.public_id, url: result.secure_url }, 'Upload successful');
            resolve(result);
          } else {
            reject(new Error('Cloudinary upload returned no result'));
          }
        }
      );

      uploadStream.end(buffer);
    });
  }

  /**
   * Delete a file from Cloudinary by public ID.
   */
  static async delete(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
      log.info({ publicId }, 'File deleted from Cloudinary');
    } catch (error) {
      log.error({ publicId, error }, 'Cloudinary delete failed');
      throw error;
    }
  }

  /**
   * Generate an optimized URL with transformations.
   */
  static generateUrl(
    publicId: string,
    options?: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string;
    }
  ): string {
    return cloudinary.url(publicId, {
      secure: true,
      transformation: [
        {
          width: options?.width,
          height: options?.height,
          crop: options?.crop || 'fill',
          quality: options?.quality || 'auto:good',
          format: 'webp',
        },
      ],
    });
  }
}
