import type { Request, Response } from 'express';
import { ReviewsService } from './reviews.service';
import { sendSuccess, sendCreated } from '../../common/responses';
import { HttpStatus } from '../../common/enums';
import { calculatePagination } from '../../common/helpers';

export class ReviewsController {
  // ── Public / Customer ─────────────────────────────────────

  static async findProductReviews(req: Request, res: Response) {
    const query = req.query as any;
    const { total, reviews } = await ReviewsService.findAll({
      page: query.page,
      limit: query.limit,
      productId: req.params.productId as string,
      rating: query.rating,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'desc',
      isApprovedOnly: true,
    });
    res.status(HttpStatus.OK).json(
      sendSuccess(reviews, 'Reviews retrieved successfully', HttpStatus.OK, calculatePagination(query.page, query.limit, total))
    );
  }

  static async findMyReviews(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    const query = req.query as any;
    const { total, reviews } = await ReviewsService.findAll({
      page: query.page,
      limit: query.limit,
      userId,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'desc',
      isApprovedOnly: false, // User can see their own unapproved reviews
    });
    res.status(HttpStatus.OK).json(
      sendSuccess(reviews, 'Your reviews retrieved successfully', HttpStatus.OK, calculatePagination(query.page, query.limit, total))
    );
  }

  static async create(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    const review = await ReviewsService.create(userId, req.body, req.ip as string, req.get('user-agent') as string);
    res.status(HttpStatus.CREATED).json(sendCreated(review, 'Review submitted successfully'));
  }

  static async update(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    const review = await ReviewsService.update(req.params.id as string , userId, req.body, req.ip as string, req.get('user-agent') as string);
    res.status(HttpStatus.OK).json(sendSuccess(review, 'Review updated successfully'));
  }

  static async delete(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    await ReviewsService.delete(req.params.id as string  as string , userId, false, req.ip as string, req.get('user-agent') as string);
    res.status(HttpStatus.NO_CONTENT).send();
  }

  // ── Admin ────────────────────────────────────────────────

  static async adminFindAll(req: Request, res: Response) {
    const query = req.query as any;
    const { total, reviews } = await ReviewsService.adminFindAll({
      page: query.page,
      limit: query.limit,
      search: query.search,
      productId: query.productId,
      userId: query.userId,
      rating: query.rating,
      isApproved: query.isApproved,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'desc',
    });
    res.status(HttpStatus.OK).json(
      sendSuccess(reviews, 'Reviews retrieved successfully', HttpStatus.OK, calculatePagination(query.page, query.limit, total))
    );
  }

  static async moderate(req: Request, res: Response) {
    const adminUserId = (req as any).user.userId;
    await ReviewsService.moderate(req.params.id as string , req.body.isApproved, adminUserId, req.ip as string, req.get('user-agent') as string);
    res.status(HttpStatus.OK).json(sendSuccess(null, 'Review moderation updated'));
  }

  static async adminDelete(req: Request, res: Response) {
    const adminUserId = (req as any).user.userId;
    await ReviewsService.delete(req.params.id as string , adminUserId, true, req.ip as string, req.get('user-agent') as string);
    res.status(HttpStatus.NO_CONTENT).send();
  }
}
