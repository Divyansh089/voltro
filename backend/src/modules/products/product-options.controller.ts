import type { Request, Response } from 'express';
import { ProductOptionsService } from './product-options.service';
import { sendSuccess, sendCreated } from '../../common/responses';
import { HttpStatus } from '../../common/enums';

export class ProductOptionsController {
  // ── Options ─────────────────────────────────────────────────

  static async getOptions(req: Request, res: Response) {
    const options = await ProductOptionsService.findByProduct(req.params.productId as string);
    res.status(HttpStatus.OK).json(sendSuccess(options, 'Options retrieved successfully'));
  }

  static async createOption(req: Request, res: Response) {
    const option = await ProductOptionsService.createOption(req.params.productId as string, req.body);
    res.status(HttpStatus.CREATED).json(sendCreated(option));
  }

  static async updateOption(req: Request, res: Response) {
    const option = await ProductOptionsService.updateOption(req.params.optionId as string, req.body);
    res.status(HttpStatus.OK).json(sendSuccess(option, 'Option updated successfully'));
  }

  static async deleteOption(req: Request, res: Response) {
    await ProductOptionsService.deleteOption(req.params.optionId as string);
    res.status(HttpStatus.NO_CONTENT).send();
  }

  // ── Option Values ────────────────────────────────────────────

  static async createValue(req: Request, res: Response) {
    const value = await ProductOptionsService.createValue(req.params.optionId as string, req.body);
    res.status(HttpStatus.CREATED).json(sendCreated(value));
  }

  static async updateValue(req: Request, res: Response) {
    const value = await ProductOptionsService.updateValue(req.params.valueId as string, req.body);
    res.status(HttpStatus.OK).json(sendSuccess(value, 'Option value updated successfully'));
  }

  static async deleteValue(req: Request, res: Response) {
    await ProductOptionsService.deleteValue(req.params.valueId as string);
    res.status(HttpStatus.NO_CONTENT).send();
  }
}
