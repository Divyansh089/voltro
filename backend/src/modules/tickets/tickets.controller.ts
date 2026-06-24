import type { Request, Response } from 'express';
import { TicketsService } from './tickets.service';
import { sendSuccess, sendCreated } from '../../common/responses';
import { HttpStatus } from '../../common/enums';
import { calculatePagination } from '../../common/helpers';

export class TicketsController {
  // ── Customer Endpoints ──────────────────────────────────

  static async findMyTickets(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    const query = req.query as any;

    const { total, tickets } = await TicketsService.findAll({
      page: query.page,
      limit: query.limit,
      userId,
      status: query.status,
      sortBy: query.sortBy || 'updatedAt',
      sortOrder: query.sortOrder || 'desc',
    });

    res.status(HttpStatus.OK).json(
      sendSuccess(tickets, 'Tickets retrieved successfully', HttpStatus.OK, calculatePagination(query.page, query.limit, total))
    );
  }

  static async findMyTicketById(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    const ticket = await TicketsService.findById(req.params.id as string, userId, false);
    res.status(HttpStatus.OK).json(sendSuccess(ticket));
  }

  static async createMyTicket(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    const ticket = await TicketsService.create(userId, req.body, req.ip as string, req.get('user-agent') as string);
    res.status(HttpStatus.CREATED).json(sendCreated(ticket, 'Ticket created successfully'));
  }

  static async addMessageToMyTicket(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    const message = await TicketsService.addMessage(req.params.id as string as string , userId, req.body.message, false);
    res.status(HttpStatus.CREATED).json(sendCreated(message, 'Message added'));
  }

  // ── Admin Endpoints ─────────────────────────────────────

  static async adminFindAll(req: Request, res: Response) {
    const query = req.query as any;

    const { total, tickets } = await TicketsService.findAll({
      page: query.page,
      limit: query.limit,
      search: query.search,
      userId: query.userId,
      status: query.status,
      priority: query.priority,
      assignedToId: query.assignedToId,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'desc',
    });

    res.status(HttpStatus.OK).json(
      sendSuccess(tickets, 'Tickets retrieved successfully', HttpStatus.OK, calculatePagination(query.page, query.limit, total))
    );
  }

  static async adminFindById(req: Request, res: Response) {
    const ticket = await TicketsService.findById(req.params.id as string, undefined, true);
    res.status(HttpStatus.OK).json(sendSuccess(ticket));
  }

  static async updateTicket(req: Request, res: Response) {
    const adminUserId = (req as any).user.userId;
    const ticket = await TicketsService.updateTicket(req.params.id as string , req.body, adminUserId, req.ip as string, req.get('user-agent') as string);
    res.status(HttpStatus.OK).json(sendSuccess(ticket, 'Ticket updated'));
  }

  static async adminAddMessage(req: Request, res: Response) {
    const adminUserId = (req as any).user.userId;
    const message = await TicketsService.addMessage(req.params.id as string , adminUserId, req.body.message, true);
    res.status(HttpStatus.CREATED).json(sendCreated(message, 'Message added'));
  }
}
