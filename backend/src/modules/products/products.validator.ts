import { z } from 'zod';
import { uuidSchema, slugSchema, paginationSchema, sortSchema, searchSchema } from '../../common/validators';
import { ProductStatus } from '../../common/enums';

export const productSpecSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
  group: z.string().default('General'),
  sortOrder: z.number().int().min(0).default(0),
});

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  basePrice: z.number().positive('Price must be positive'),
  categoryId: uuidSchema,
  brand: z.string().default('Voltra'),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.DRAFT),
  specifications: z.array(productSpecSchema).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productListQuerySchema = paginationSchema.merge(sortSchema).merge(searchSchema).extend({
  categoryId: uuidSchema.optional(),
  brand: z.string().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  hasStock: z.enum(['true', 'false']).optional().transform(val => val === 'true' ? true : val === 'false' ? false : undefined),
});

export const addImageSchema = z.object({
  altText: z.string().optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isPrimary: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
});

export const updateImageSchema = z.object({
  altText: z.string().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isPrimary: z.boolean().optional(),
});
