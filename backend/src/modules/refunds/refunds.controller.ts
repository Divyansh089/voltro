import type { Request, Response } from 'express';
import { RefundsService } from './refunds.service';
import { sendSuccess, sendCreated } from '../../common/responses';
import { HttpStatus } from '../../common/enums';
import { calculatePagination } from '../../common/helpers';

export class RefundsController {
  // ── Customer Endpoints ──────────────────────────────────

  static async findMyRefunds(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    const query = req.query as any;

    const { total, refunds } = await RefundsService.findAll({
      page: query.page,
      limit: query.limit,
      userId,
      status: query.status,
      orderId: query.orderId,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'desc',
    });

    res.status(HttpStatus.OK).json(
      sendSuccess(refunds, 'Refund requests retrieved successfully', HttpStatus.OK, calculatePagination(query.page, query.limit, total))
    );
  }

  static async findMyRefundById(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    const refund = await RefundsService.findById(req.params.id as string, userId, false);
    res.status(HttpStatus.OK).json(sendSuccess(refund));
  }

  static async createMyRefund(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    const refund = await RefundsService.create(userId, req.body, req.ip as string, req.get('user-agent') as string);
    res.status(HttpStatus.CREATED).json(sendCreated(refund, 'Refund requested successfully'));
  }

  // ── Admin Endpoints ─────────────────────────────────────

  static async adminFindAll(req: Request, res: Response) {
    const query = req.query as any;

    const { total, refunds } = await RefundsService.findAll({
      page: query.page,
      limit: query.limit,
      search: query.search,
      userId: query.userId,
      status: query.status,
      orderId: query.orderId,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'desc',
    });

    res.status(HttpStatus.OK).json(
      sendSuccess(refunds, 'Refund requests retrieved successfully', HttpStatus.OK, calculatePagination(query.page, query.limit, total))
    );
  }

  static async adminFindById(req: Request, res: Response) {
    const refund = await RefundsService.findById(req.params.id as string, undefined, true);
    res.status(HttpStatus.OK).json(sendSuccess(refund));
  }

  static async updateStatus(req: Request, res: Response) {
    const adminUserId = (req as any).user.userId;
    const refund = await RefundsService.updateStatus(
      req.params.id as string,
      req.body.status,
      req.body.adminNotes,
      adminUserId,
      req.ip as string,
      req.get('user-agent') as string
    );
    res.status(HttpStatus.OK).json(sendSuccess(refund, 'Refund status updated'));
  }
}
