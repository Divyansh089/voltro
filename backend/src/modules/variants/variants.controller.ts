import type { Request, Response } from 'express';
import { VariantsService } from './variants.service';
import { sendSuccess, sendCreated } from '../../common/responses';
import { HttpStatus } from '../../common/enums';
import { calculatePagination } from '../../common/helpers';

export class VariantsController {
  static async findAll(req: Request, res: Response) {
    const query = req.query as any;
    
    const { total, variants } = await VariantsService.findAll({
      page: query.page,
      limit: query.limit,
      search: query.search,
      productId: query.productId,
      isActive: query.isActive,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    res.status(HttpStatus.OK).json(
      sendSuccess(variants, 'Variants retrieved successfully', HttpStatus.OK, calculatePagination(query.page, query.limit, total))
    );
  }

  static async findById(req: Request, res: Response) {
    const variant = await VariantsService.findById(req.params.id as string );
    res.status(HttpStatus.OK).json(sendSuccess(variant));
  }

  static async create(req: Request, res: Response) {
    const adminUserId = (req as any).user.userId;
    const variant = await VariantsService.create(
      req.body,
      adminUserId,
      req.ip as string,
      req.get('user-agent') as string
    );
    res.status(HttpStatus.CREATED).json(sendCreated(variant));
  }

  static async update(req: Request, res: Response) {
    const adminUserId = (req as any).user.userId;
    const variant = await VariantsService.update(
      req.params.id as string ,
      req.body,
      adminUserId,
      req.ip as string,
      req.get('user-agent') as string
    );
    res.status(HttpStatus.OK).json(sendSuccess(variant, 'Variant updated successfully'));
  }

  static async delete(req: Request, res: Response) {
    const adminUserId = (req as any).user.userId;
    await VariantsService.delete(
      req.params.id as string ,
      adminUserId,
      req.ip as string,
      req.get('user-agent') as string
    );
    res.status(HttpStatus.NO_CONTENT).send();
  }
}
