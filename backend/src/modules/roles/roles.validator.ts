import { z } from 'zod';
import { uuidSchema, paginationSchema, sortSchema, searchSchema } from '../../common/validators';

export const createRoleSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters').toUpperCase(),
  description: z.string().optional(),
  permissions: z.array(uuidSchema).optional(), // Array of permission IDs
});

export const updateRoleSchema = createRoleSchema.partial();

export const roleListQuerySchema = paginationSchema.merge(sortSchema).merge(searchSchema);

export const permissionListQuerySchema = paginationSchema.merge(sortSchema).merge(searchSchema).extend({
  resource: z.string().optional(),
});
