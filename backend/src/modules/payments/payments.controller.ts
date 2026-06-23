import type { Request, Response } from 'express';
import { PaymentsService } from './payments.service';
import { sendSuccess } from '../../common/responses';
import { HttpStatus } from '../../common/enums';
import { calculatePagination } from '../../common/helpers';

export class PaymentsController {
  static async findAll(req: Request, res: Response) {
    const query = req.query as any;

    const { total, payments } = await PaymentsService.findAll({
      page: query.page,
      limit: query.limit,
      status: query.status,
      orderId: query.orderId,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'desc',
    });

    res.status(HttpStatus.OK).json(
      sendSuccess(payments, 'Payments retrieved successfully', HttpStatus.OK, calculatePagination(query.page, query.limit, total))
    );
  }

  static async updateStatus(req: Request, res: Response) {
    const payment = await PaymentsService.updateStatus(req.params.orderId as string, req.body);
    res.status(HttpStatus.OK).json(sendSuccess(payment, 'Payment status updated'));
  }
}
