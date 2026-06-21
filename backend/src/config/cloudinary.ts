import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';
import { createModuleLogger } from './logger';

const log = createModuleLogger('cloudinary');

/**
 * Cloudinary Configuration
 *
 * Configures the Cloudinary SDK with credentials from environment.
 * Provides default upload presets and transformation settings.
 */
export function configureCloudinary(): void {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  log.info('Cloudinary configured successfully');
}

/** Cloudinary folder structure */
export const CLOUDINARY_FOLDERS = {
  PRODUCTS: 'voltra/products',
  AVATARS: 'voltra/avatars',
  BANNERS: 'voltra/banners',
  CAMPAIGNS: 'voltra/campaigns',
  SUPPORT: 'voltra/support',
} as const;

/** Default upload options */
export const UPLOAD_DEFAULTS = {
  /** Max file size in bytes (5MB) */
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  /** Allowed MIME types */
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as string[],
  /** Default quality for optimization */
  DEFAULT_QUALITY: 80,
  /** Max width for product images */
  MAX_IMAGE_WIDTH: 2000,
} as const;

export { cloudinary };
