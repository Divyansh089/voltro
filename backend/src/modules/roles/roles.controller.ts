import type { Request, Response } from 'express';
import { RolesService } from './roles.service';
import { sendSuccess, sendCreated } from '../../common/responses';
import { HttpStatus } from '../../common/enums';
import { calculatePagination } from '../../common/helpers';

export class RolesController {
  // ── Roles ────────────────────────────────────────────────

  static async create(req: Request, res: Response) {
    const adminUserId = (req as any).user.userId;
    const newRole = await RolesService.create(
      req.body,
      adminUserId,
      req.ip as string,
      req.get('user-agent') as string
    );
    res.status(HttpStatus.CREATED).json(sendCreated(newRole));
  }

  static async findAll(req: Request, res: Response) {
    const query = req.query as any;
    const { total, roles } = await RolesService.findAll({
      page: query.page,
      limit: query.limit,
      search: query.search,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
    res.status(HttpStatus.OK).json(
      sendSuccess(roles, 'Roles retrieved successfully', HttpStatus.OK, calculatePagination(query.page, query.limit, total))
    );
  }

  static async findById(req: Request, res: Response) {
    const role = await RolesService.findById(req.params.id as string  as string );
    res.status(HttpStatus.OK).json(sendSuccess(role));
  }

  static async update(req: Request, res: Response) {
    const adminUserId = (req as any).user.userId;
    const updatedRole = await RolesService.update(
      req.params.id as string ,
      req.body,
      adminUserId,
      req.ip as string,
      req.get('user-agent') as string
    );
    res.status(HttpStatus.OK).json(sendSuccess(updatedRole, 'Role updated successfully'));
  }

  static async delete(req: Request, res: Response) {
    const adminUserId = (req as any).user.userId;
    await RolesService.delete(
      req.params.id as string ,
      adminUserId,
      req.ip as string,
      req.get('user-agent') as string
    );
    res.status(HttpStatus.NO_CONTENT).send();
  }

  // ── Permissions ──────────────────────────────────────────

  static async findAllPermissions(req: Request, res: Response) {
    const query = req.query as any;
    const { total, permissions } = await RolesService.findAllPermissions({
      page: query.page,
      limit: query.limit,
      search: query.search,
      resource: query.resource,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
    res.status(HttpStatus.OK).json(
      sendSuccess(permissions, 'Permissions retrieved successfully', HttpStatus.OK, calculatePagination(query.page, query.limit, total))
    );
  }
}
