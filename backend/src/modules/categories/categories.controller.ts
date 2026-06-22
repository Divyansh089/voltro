import type { Request, Response } from 'express';
import { CategoriesService } from './categories.service';
import { sendSuccess, sendCreated } from '../../common/responses';
import { HttpStatus } from '../../common/enums';
import { calculatePagination } from '../../common/helpers';

export class CategoriesController {
  static async create(req: Request, res: Response) {
    const adminUserId = (req as any).user.userId;
    const category = await CategoriesService.create(
      req.body,
      adminUserId,
      req.ip as string,
      req.get('user-agent') as string
    );
    res.status(HttpStatus.CREATED).json(sendCreated(category));
  }

  static async findAll(req: Request, res: Response) {
    const query = req.query as any;
    const { total, categories } = await CategoriesService.findAll({
      page: query.page,
      limit: query.limit,
      search: query.search,
      isActive: query.isActive,
      parentId: query.parentId,
      rootOnly: query.rootOnly,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
    res.status(HttpStatus.OK).json(
      sendSuccess(categories, 'Categories retrieved successfully', HttpStatus.OK, calculatePagination(query.page, query.limit, total))
    );
  }

  static async getTree(req: Request, res: Response) {
    // If admin, they might want to see inactive categories too
    const isAdmin = (req as any).user?.role === 'ADMIN' || (req as any).user?.role === 'SUPER_ADMIN';
    const activeOnly = !isAdmin; // Public users only see active categories

    const tree = await CategoriesService.getTree(activeOnly);
    res.status(HttpStatus.OK).json(sendSuccess(tree, 'Category tree retrieved'));
  }

  static async findByIdOrSlug(req: Request, res: Response) {
    const category = await CategoriesService.findByIdOrSlug(req.params.idOrSlug as string );
    res.status(HttpStatus.OK).json(sendSuccess(category));
  }

  static async update(req: Request, res: Response) {
    const adminUserId = (req as any).user.userId;
    const category = await CategoriesService.update(
      req.params.id as string ,
      req.body,
      adminUserId,
      req.ip as string,
      req.get('user-agent') as string
    );
    res.status(HttpStatus.OK).json(sendSuccess(category, 'Category updated successfully'));
  }

  static async delete(req: Request, res: Response) {
    const adminUserId = (req as any).user.userId;
    await CategoriesService.delete(
      req.params.id as string ,
      adminUserId,
      req.ip as string,
      req.get('user-agent') as string
    );
    res.status(HttpStatus.NO_CONTENT).send();
  }
}
