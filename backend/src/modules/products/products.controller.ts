import type { Request, Response } from 'express';
import { ProductsService } from './products.service';
import { sendSuccess, sendCreated } from '../../common/responses';
import { HttpStatus } from '../../common/enums';
import { calculatePagination } from '../../common/helpers';

export class ProductsController {
  // ── Public Endpoints ─────────────────────────────────────

  static async findByIdOrSlug(req: Request, res: Response) {
    const isPublic = !((req as any).user?.role === 'ADMIN' || (req as any).user?.role === 'SUPER_ADMIN' || (req as any).user?.role === 'MANAGER');
    
    const product = await ProductsService.findByIdOrSlug(req.params.idOrSlug as string, isPublic);
    res.status(HttpStatus.OK).json(sendSuccess(product));
  }

  static async findAll(req: Request, res: Response) {
    const isPublic = !((req as any).user?.role === 'ADMIN' || (req as any).user?.role === 'SUPER_ADMIN' || (req as any).user?.role === 'MANAGER');
    const query = req.query as any;
    
    const { total, products } = await ProductsService.findAll({
      page: query.page,
      limit: query.limit,
      search: query.search,
      categoryId: query.categoryId,
      brand: query.brand,
      status: query.status,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      hasStock: query.hasStock,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      isPublic,
    });

    res.status(HttpStatus.OK).json(
      sendSuccess(products, 'Products retrieved successfully', HttpStatus.OK, calculatePagination(query.page, query.limit, total))
    );
  }

  // ── Admin Endpoints ──────────────────────────────────────

  static async create(req: Request, res: Response) {
    const adminUserId = (req as any).user.userId;
    const product = await ProductsService.create(
      req.body,
      adminUserId,
      req.ip as string,
      req.get('user-agent') as string
    );
    res.status(HttpStatus.CREATED).json(sendCreated(product));
  }

  static async update(req: Request, res: Response) {
    const adminUserId = (req as any).user.userId;
    const product = await ProductsService.update(
      req.params.id as string,
      req.body,
      adminUserId,
      req.ip as string,
      req.get('user-agent') as string
    );
    res.status(HttpStatus.OK).json(sendSuccess(product, 'Product updated successfully'));
  }

  static async delete(req: Request, res: Response) {
    const adminUserId = (req as any).user.userId;
    await ProductsService.delete(
      req.params.id as string,
      adminUserId,
      req.ip as string,
      req.get('user-agent') as string
    );
    res.status(HttpStatus.NO_CONTENT).send();
  }

  // ── Product Images ───────────────────────────────────────

  static async addImage(req: Request, res: Response) {
    if (!req.file) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'No image file provided',
      });
      return;
    }

    const image = await ProductsService.addImage(req.params.id as string, req.file, req.body);
    res.status(HttpStatus.CREATED).json(sendCreated(image, 'Image added successfully'));
  }

  static async updateImage(req: Request, res: Response) {
    const image = await ProductsService.updateImage(req.params.imageId as string , req.body);
    res.status(HttpStatus.OK).json(sendSuccess(image, 'Image updated successfully'));
  }

  static async deleteImage(req: Request, res: Response) {
    await ProductsService.deleteImage(req.params.imageId as string );
    res.status(HttpStatus.NO_CONTENT).send();
  }
}
