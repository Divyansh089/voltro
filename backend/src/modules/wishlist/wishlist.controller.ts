import type { Request, Response } from 'express';
import { WishlistService } from './wishlist.service';
import { sendSuccess, sendCreated } from '../../common/responses';
import { HttpStatus } from '../../common/enums';
import { calculatePagination } from '../../common/helpers';

export class WishlistController {
  static async findAll(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    const query = req.query as any;

    const { total, items } = await WishlistService.findAll({
      userId,
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'desc',
    });

    res.status(HttpStatus.OK).json(
      sendSuccess(items, 'Wishlist retrieved successfully', HttpStatus.OK, calculatePagination(query.page, query.limit, total))
    );
  }

  static async addItem(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    const item = await WishlistService.addItem(userId, req.body.productId);
    res.status(HttpStatus.CREATED).json(sendCreated(item, 'Item added to wishlist'));
  }

  static async removeItem(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    await WishlistService.removeItem(userId, req.params.productId as string );
    res.status(HttpStatus.NO_CONTENT).send();
  }

  static async clear(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    await WishlistService.clear(userId);
    res.status(HttpStatus.NO_CONTENT).send();
  }
}
