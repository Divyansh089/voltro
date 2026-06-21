import { env, isDevelopment } from './env';
import type { Options } from 'swagger-jsdoc';

/**
 * Swagger/OpenAPI Configuration
 *
 * Generates API documentation from JSDoc comments in route files.
 * Only enabled in development and staging environments.
 */
export const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Voltra API',
      version: '1.0.0',
      description: 'Voltra D2C Consumer Electronics — Backend API Documentation',
      contact: {
        name: 'Voltra Engineering',
        email: 'engineering@voltra.com',
      },
      license: {
        name: 'Proprietary',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api/${env.API_VERSION}`,
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your access token',
        },
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            statusCode: { type: 'integer', example: 200 },
            message: { type: 'string', example: 'Operation successful' },
            data: { type: 'object' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            statusCode: { type: 'integer', example: 400 },
            message: { type: 'string', example: 'Bad Request' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            total: { type: 'integer', example: 142 },
            totalPages: { type: 'integer', example: 8 },
            hasNextPage: { type: 'boolean', example: true },
            hasPrevPage: { type: 'boolean', example: false },
          },
        },
      },
    },
    tags: [
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'Auth', description: 'Authentication & session management' },
      { name: 'Users', description: 'User management' },
      { name: 'Customers', description: 'Customer profile management' },
      { name: 'Staff', description: 'Staff management' },
      { name: 'Roles', description: 'Role & permission management' },
      { name: 'Products', description: 'Product catalog' },
      { name: 'Categories', description: 'Product categories' },
      { name: 'Variants', description: 'Product variants' },
      { name: 'Inventory', description: 'Stock management' },
      { name: 'Cart', description: 'Shopping cart' },
      { name: 'Wishlist', description: 'Wishlist management' },
      { name: 'Orders', description: 'Order lifecycle' },
      { name: 'Payments', description: 'Payment processing' },
      { name: 'Coupons', description: 'Discount & coupon management' },
      { name: 'Reviews', description: 'Product reviews' },
      { name: 'Support', description: 'Customer support tickets' },
      { name: 'Notifications', description: 'User notifications' },
      { name: 'CMS', description: 'Content management (banners, featured, campaigns)' },
      { name: 'Dashboard', description: 'Admin dashboard metrics' },
      { name: 'Analytics', description: 'Business analytics' },
      { name: 'Audit', description: 'Audit trail' },
    ],
  },
  apis: [
    './src/modules/**/routes/*.ts',
    './src/routes/*.ts',
  ],
};

/** Whether to enable Swagger docs */
export const isSwaggerEnabled = !isDevelopment || env.NODE_ENV !== 'production';
