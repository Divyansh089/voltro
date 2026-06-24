import { Router } from 'express';
import { TicketsController } from '../tickets.controller';
import { validate } from '../../../middleware/validation.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { permission } from '../../../middleware/permission.middleware';
import { createTicketSchema, updateTicketSchema, addMessageSchema, ticketQuerySchema } from '../tickets.validator';
import { idParamSchema } from '../../../common/validators';
import { asyncHandler } from '../../../common/utils/asyncHandler';

const router = Router();

router.use(authMiddleware);

// ── Customer Routes ──────────────────────────────────────

router.get(
  '/me',
  validate(ticketQuerySchema, 'query'),
  asyncHandler(TicketsController.findMyTickets)
);

router.get(
  '/me/:id',
  validate(idParamSchema, 'params'),
  asyncHandler(TicketsController.findMyTicketById)
);

router.post(
  '/',
  validate(createTicketSchema, 'body'),
  asyncHandler(TicketsController.createMyTicket)
);

router.post(
  '/me/:id/messages',
  validate(idParamSchema, 'params'),
  validate(addMessageSchema, 'body'),
  asyncHandler(TicketsController.addMessageToMyTicket)
);

// ── Admin Routes ─────────────────────────────────────────

router.get(
  '/',
  permission('support:read'),
  validate(ticketQuerySchema, 'query'),
  asyncHandler(TicketsController.adminFindAll)
);

router.get(
  '/:id',
  permission('support:read'),
  validate(idParamSchema, 'params'),
  asyncHandler(TicketsController.adminFindById)
);

router.patch(
  '/:id',
  permission('support:update'),
  validate(idParamSchema, 'params'),
  validate(updateTicketSchema, 'body'),
  asyncHandler(TicketsController.updateTicket)
);

router.post(
  '/:id/messages',
  permission('support:update'),
  validate(idParamSchema, 'params'),
  validate(addMessageSchema, 'body'),
  asyncHandler(TicketsController.adminAddMessage)
);

export default router;
