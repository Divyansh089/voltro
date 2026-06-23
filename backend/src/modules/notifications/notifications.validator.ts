import { z } from 'zod';
import { uuidSchema, paginationSchema, sortSchema } from '../../common/validators';

export const notificationQuerySchema = paginationSchema.merge(sortSchema).extend({
  isRead: z.enum(['true', 'false']).optional().transform(val => val === 'true' ? true : val === 'false' ? false : undefined),
});

export const markAsReadSchema = z.object({
  notificationIds: z.array(uuidSchema).min(1),
});
