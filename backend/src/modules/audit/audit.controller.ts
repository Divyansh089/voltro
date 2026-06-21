import type { Request, Response } from 'express';
import { AuditService } from './audit.service';
import { sendSuccess } from '../../common/responses';
import { HttpStatus } from '../../common/enums';
import { calculatePagination } from '../../common/helpers';

export class AuditController {
  static async findAll(req: Request, res: Response) {
    const query = req.query as any;
    
    const { total, logs } = await AuditService.findAll({
      page: query.page,
      limit: query.limit,
      userId: query.userId,
      action: query.action,
      resource: query.resource,
      resourceId: query.resourceId,
      startDate: query.startDate,
      endDate: query.endDate,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    res.status(HttpStatus.OK).json(
      sendSuccess(
        logs,
        'Audit logs retrieved successfully',
        HttpStatus.OK,
        calculatePagination(query.page, query.limit, total)
      )
    );
  }
}
