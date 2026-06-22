import { z } from 'zod';
import { paginationSchema, sortSchema, uuidSchema } from '../../common/validators';
import { AuditAction } from '../../common/enums';

export const auditLogQuerySchema = paginationSchema.merge(sortSchema).extend({
  userId: uuidSchema.optional(),
  action: z.nativeEnum(AuditAction).optional(),
  resource: z.string().optional(),
  resourceId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});
