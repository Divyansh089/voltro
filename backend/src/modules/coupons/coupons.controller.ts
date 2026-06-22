import type { Request, Response } from 'express';
import { CouponsService } from './coupons.service';
import { sendSuccess, sendCreated } from '../../common/responses';
import { HttpStatus } from '../../common/enums';
import { calculatePagination } from '../../common/helpers';

export class CouponsController {
  static async findAll(req: Request, res: Response) {
    const query = req.query as any;
    const { total, coupons } = await CouponsService.findAll({
      page: query.page,
      limit: query.limit,
      search: query.search,
      isActive: query.isActive,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'desc',
    });
    res.status(HttpStatus.OK).json(
      sendSuccess(coupons, 'Coupons retrieved successfully', HttpStatus.OK, calculatePagination(query.page, query.limit, total))
    );
  }

  static async findById(req: Request, res: Response) {
    const coupon = await CouponsService.findById(req.params.id as string );
    res.status(HttpStatus.OK).json(sendSuccess(coupon));
  }

  static async create(req: Request, res: Response) {
    const adminUserId = (req as any).user.userId;
    const coupon = await CouponsService.create(req.body, adminUserId, req.ip as string, req.get('user-agent') as string);
    res.status(HttpStatus.CREATED).json(sendCreated(coupon));
  }

  static async update(req: Request, res: Response) {
    const adminUserId = (req as any).user.userId;
    const coupon = await CouponsService.update(req.params.id as string , req.body, adminUserId, req.ip as string, req.get('user-agent') as string);
    res.status(HttpStatus.OK).json(sendSuccess(coupon, 'Coupon updated'));
  }

  static async delete(req: Request, res: Response) {
    const adminUserId = (req as any).user.userId;
    await CouponsService.delete(req.params.id as string , adminUserId, req.ip as string, req.get('user-agent') as string);
    res.status(HttpStatus.NO_CONTENT).send();
  }

  static async validateCoupon(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    const { code, orderAmount } = req.body;
    
    const result = await CouponsService.validateCoupon(code, userId, orderAmount);
    res.status(HttpStatus.OK).json(sendSuccess(result, 'Coupon is valid'));
  }
}
