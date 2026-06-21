import type { Request, Response } from 'express';
import { AddressesService } from './addresses.service';
import { sendSuccess, sendCreated } from '../../common/responses';
import { HttpStatus } from '../../common/enums';
import { calculatePagination } from '../../common/helpers';

export class AddressesController {
  // ── Customer Endpoints ──────────────────────────────────

  static async findMyAddresses(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    const addresses = await AddressesService.findAll(userId);
    res.status(HttpStatus.OK).json(sendSuccess(addresses));
  }

  static async findMyAddressById(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    const address = await AddressesService.findById(req.params.id as string , userId);
    res.status(HttpStatus.OK).json(sendSuccess(address));
  }

  static async createMyAddress(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    const address = await AddressesService.create(
      userId,
      req.body,
      req.ip as string,
      req.get('user-agent') as string
    );
    res.status(HttpStatus.CREATED).json(sendCreated(address));
  }

  static async updateMyAddress(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    const address = await AddressesService.update(
      req.params.id as string ,
      userId,
      req.body,
      req.ip as string,
      req.get('user-agent') as string
    );
    res.status(HttpStatus.OK).json(sendSuccess(address));
  }

  static async deleteMyAddress(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    await AddressesService.delete(
      req.params.id as string ,
      userId,
      req.ip as string,
      req.get('user-agent') as string
    );
    res.status(HttpStatus.NO_CONTENT).send();
  }

  // ── Admin Endpoints ─────────────────────────────────────

  static async adminFindAll(req: Request, res: Response) {
    const query = req.query as any;
    const { total, addresses } = await AddressesService.adminFindAll({
      page: query.page,
      limit: query.limit,
      userId: query.userId,
    });
    res.status(HttpStatus.OK).json(
      sendSuccess(addresses, 'Addresses retrieved successfully', HttpStatus.OK, calculatePagination(query.page, query.limit, total))
    );
  }
}
