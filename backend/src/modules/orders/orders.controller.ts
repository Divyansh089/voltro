import type { Request, Response } from 'express';
import { OrdersService } from './orders.service';
import { sendSuccess, sendCreated } from '../../common/responses';
import { HttpStatus } from '../../common/enums';
import { calculatePagination } from '../../common/helpers';

export class OrdersController {
  // ── Customer Endpoints ──────────────────────────────────

  static async findMyOrders(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    const query = req.query as any;

    const { total, orders } = await OrdersService.findAll({
      page: query.page,
      limit: query.limit,
      userId,
      status: query.status,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'desc',
    });

    res.status(HttpStatus.OK).json(
      sendSuccess(orders, 'Orders retrieved successfully', HttpStatus.OK, calculatePagination(query.page, query.limit, total))
    );
  }

  static async findMyOrderById(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    const order = await OrdersService.findById(req.params.id as string, userId, false);
    res.status(HttpStatus.OK).json(sendSuccess(order));
  }

  static async create(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    const order = await OrdersService.createFromCart(
      userId,
      req.body,
      req.ip as string,
      req.get('user-agent') as string
    );
    res.status(HttpStatus.CREATED).json(sendCreated(order, 'Order placed successfully'));
  }

  static async cancelMyOrder(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    // Simple check to ensure user owns order before cancelling
    await OrdersService.findById(req.params.id as string, userId, false); 
    const order = await OrdersService.updateStatus(req.params.id as string, 'CANCELLED', 'Cancelled by customer', userId, req.ip as string, req.get('user-agent') as string);
    res.status(HttpStatus.OK).json(sendSuccess(order, 'Order cancelled successfully'));
  }

  // ── Admin Endpoints ─────────────────────────────────────

  static async adminFindAll(req: Request, res: Response) {
    const query = req.query as any;

    const { total, orders } = await OrdersService.findAll({
      page: query.page,
      limit: query.limit,
      search: query.search,
      userId: query.userId,
      status: query.status,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'desc',
    });

    res.status(HttpStatus.OK).json(
      sendSuccess(orders, 'Orders retrieved successfully', HttpStatus.OK, calculatePagination(query.page, query.limit, total))
    );
  }

  static async adminFindById(req: Request, res: Response) {
    const order = await OrdersService.findById(req.params.id as string, undefined, true);
    res.status(HttpStatus.OK).json(sendSuccess(order));
  }

  static async updateStatus(req: Request, res: Response) {
    const adminUserId = (req as any).user.userId;
    const order = await OrdersService.updateStatus(
      req.params.id as string,
      req.body.status,
      req.body.cancellationReason,
      adminUserId,
      req.ip as string,
      req.get('user-agent') as string
    );
    res.status(HttpStatus.OK).json(sendSuccess(order, 'Order status updated successfully'));
  }
}
