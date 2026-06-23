import { z } from 'zod';
import { uuidSchema, paginationSchema, sortSchema } from '../../common/validators';

export const updatePaymentSchema = z.object({
  status: z.enum(['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED']),
  gatewayPaymentId: z.string().optional(),
  gatewayOrderId: z.string().optional(),
  method: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const paymentQuerySchema = paginationSchema.merge(sortSchema).extend({
  status: z.string().optional(),
  orderId: uuidSchema.optional(),
});
