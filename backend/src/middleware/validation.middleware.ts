import type { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../common/errors';

/**
 * Validation Source — which part of the request to validate
 */
type ValidationSource = 'body' | 'params' | 'query';

/**
 * Validation Middleware Factory
 *
 * Validates request data against a Zod schema.
 * On success, the validated data replaces the raw data (now type-safe).
 * On failure, returns 422 with field-level error details.
 *
 * @example
 *   router.post('/products', validate(createProductSchema, 'body'), controller.create);
 *   router.get('/products/:id', validate(idParamSchema, 'params'), controller.findOne);
 */
export function validate(schema: ZodSchema, source: ValidationSource = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const result = schema.parse(req[source]);
      // Replace with validated & transformed data
      (req as any)[source] = result;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        next(new ValidationError('Validation failed', fieldErrors));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Validate multiple sources in a single middleware call.
 *
 * @example
 *   router.patch('/products/:id',
 *     validateMultiple({ params: idParamSchema, body: updateProductSchema }),
 *     controller.update
 *   );
 */
export function validateMultiple(schemas: Partial<Record<ValidationSource, ZodSchema>>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      for (const [source, schema] of Object.entries(schemas)) {
        if (schema) {
          const result = schema.parse(req[source as ValidationSource]);
          (req as any)[source] = result;
        }
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        next(new ValidationError('Validation failed', fieldErrors));
      } else {
        next(error);
      }
    }
  };
}
