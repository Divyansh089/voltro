import type { Request, Response } from 'express';
import { CartService } from './cart.service';
import { sendSuccess } from '../../common/responses';
import { HttpStatus } from '../../common/enums';

export class CartController {
  static async getCart(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    const cart = await CartService.getCart(userId);
    res.status(HttpStatus.OK).json(sendSuccess(cart));
  }

  static async addItem(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    const cart = await CartService.addItem(userId, req.body);
    res.status(HttpStatus.OK).json(sendSuccess(cart, 'Item added to cart'));
  }

  static async updateItem(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    const cart = await CartService.updateItem(userId, req.params.id as string , req.body.quantity);
    res.status(HttpStatus.OK).json(sendSuccess(cart, 'Cart updated'));
  }

  static async removeItem(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    const cart = await CartService.removeItem(userId, req.params.id as string );
    res.status(HttpStatus.OK).json(sendSuccess(cart, 'Item removed from cart'));
  }

  static async clearCart(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    const cart = await CartService.clearCart(userId);
    res.status(HttpStatus.OK).json(sendSuccess(cart, 'Cart cleared'));
  }
}
