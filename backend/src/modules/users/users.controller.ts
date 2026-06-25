import type { Request, Response } from 'express';
import { UsersService } from './users.service';
import { sendSuccess } from '../../common/responses';
import { HttpStatus } from '../../common/enums';
import { calculatePagination } from '../../common/helpers';

export class UsersController {
  static async findById(req: Request, res: Response) {
    const user = await UsersService.findById(req.params.id as string );
    res.status(HttpStatus.OK).json(sendSuccess(user));
  }

  static async findAll(req: Request, res: Response) {
    const query = req.query as any;
    
    const { total, users } = await UsersService.findAll({
      page: query.page,
      limit: query.limit,
      search: query.search,
      role: query.role,
      isActive: query.isActive,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    res.status(HttpStatus.OK).json(
      sendSuccess(
        users,
        'Users retrieved successfully',
        HttpStatus.OK,
        calculatePagination(query.page, query.limit, total)
      )
    );
  }

  static async update(req: Request, res: Response) {
    const adminUserId = (req as any).user.userId;
    const updatedUser = await UsersService.update(
      req.params.id as string ,
      req.body,
      adminUserId,
      req.ip as string,
      req.get('user-agent') as string
    );
    
    res.status(HttpStatus.OK).json(sendSuccess(updatedUser, 'User updated successfully'));
  }

  static async delete(req: Request, res: Response) {
    const adminUserId = (req as any).user.userId;
    await UsersService.delete(
      req.params.id as string  ,
      adminUserId,
      req.ip as string,
      req.get('user-agent') as string
    );
    
    res.status(HttpStatus.NO_CONTENT).send();
  }
}
