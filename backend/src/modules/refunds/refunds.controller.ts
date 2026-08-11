import { Request, Response } from 'express';
import { RefundsService } from './refunds.service';
import { sendSuccess } from '../../common/responses/apiResponse';
import { HttpStatus } from '../../common/enums/httpStatus.enum';
import { calculatePagination } from '../../common/helpers';

export class RefundsController {
  static async findAll(req: Request, res: Response) {
    const query = req.query as any;
    const { total, refunds, page, limit } = await RefundsService.findAll({
      page: query.page,
      limit: query.limit,
      status: query.status,
      search: query.search,
    });

    res.status(HttpStatus.OK).json(
      sendSuccess(refunds, 'Refund requests retrieved successfully', HttpStatus.OK, calculatePagination(page, limit, total))
    );
  }

  static async updateStatus(req: Request, res: Response) {
    const staffUserId = (req as any).user.userId;
    const { status, adminNotes } = req.body;
    const updated = await RefundsService.updateStatus(
      req.params.id as string,
      status,
      staffUserId,
      adminNotes
    );

    res.status(HttpStatus.OK).json(
      sendSuccess(updated, `Refund request ${status.toLowerCase()} successfully`)
    );
  }
}
