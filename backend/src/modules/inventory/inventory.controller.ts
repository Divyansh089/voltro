import type { Request, Response } from 'express';
import { InventoryService } from './inventory.service';
import { sendSuccess } from '../../common/responses';
import { HttpStatus } from '../../common/enums';
import { calculatePagination } from '../../common/helpers';

export class InventoryController {
  static async findAll(req: Request, res: Response) {
    const query = req.query as any;
    
    const { total, inventories } = await InventoryService.findAll({
      page: query.page,
      limit: query.limit,
      variantId: query.variantId,
      productId: query.productId,
      lowStockOnly: query.lowStockOnly,
      sortBy: query.sortBy || 'updatedAt',
      sortOrder: query.sortOrder || 'desc',
    });

    res.status(HttpStatus.OK).json(
      sendSuccess(inventories, 'Inventory retrieved successfully', HttpStatus.OK, calculatePagination(query.page, query.limit, total))
    );
  }

  static async findByVariantId(req: Request, res: Response) {
    const inventory = await InventoryService.findByVariantId(req.params.variantId as string);
    res.status(HttpStatus.OK).json(sendSuccess(inventory));
  }

  static async setLevel(req: Request, res: Response) {
    const adminUserId = (req as any).user.userId;
    const inventory = await InventoryService.setLevel(
      req.params.variantId as string,
      req.body,
      adminUserId,
      req.ip as string,
      req.get('user-agent') as string
    );
    res.status(HttpStatus.OK).json(sendSuccess(inventory, 'Inventory level updated'));
  }

  static async adjust(req: Request, res: Response) {
    const adminUserId = (req as any).user.userId;
    const inventory = await InventoryService.adjust(
      req.params.variantId as string,
      req.body,
      adminUserId,
      req.ip as string,
      req.get('user-agent') as string
    );
    res.status(HttpStatus.OK).json(sendSuccess(inventory, 'Inventory adjusted successfully'));
  }
}
