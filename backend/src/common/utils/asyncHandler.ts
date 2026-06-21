import type { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async Express handler to catch errors and forward them
 * to the global error handler via next().
 *
 * Usage:
 *   router.get('/products', asyncHandler(ProductController.findAll));
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
