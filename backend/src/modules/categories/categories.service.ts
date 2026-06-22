import prisma from '../../prisma/prismaClient';
import { NotFoundError, ConflictError, BadRequestError } from '../../common/errors';
import { slugify, generateUniqueSlug } from '../../common/helpers';
import { AuditAction } from '../../common/enums';
import { CacheService } from '../../cache/cache.service';
import { CacheKeys } from '../../cache/cacheKeys';
import { TTL } from '../../cache/ttl';
import type { Prisma } from '@prisma/client';
import { createModuleLogger } from '../../config/logger';

const log = createModuleLogger('categories.service');

export class CategoriesService {
  /**
   * Find a category by ID or Slug
   */
  static async findByIdOrSlug(idOrSlug: string) {
    const category = await prisma.category.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: {
          select: { id: true, name: true, slug: true, imageUrl: true, isActive: true, sortOrder: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!category) {
      throw new NotFoundError('Category', idOrSlug);
    }

    return category;
  }

  /**
   * List all categories (flat list with pagination)
   */
  static async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    isActive?: boolean;
    parentId?: string;
    rootOnly?: boolean;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) {
    const { page, limit, search, isActive, parentId, rootOnly, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(isActive !== undefined && { isActive }),
      ...(parentId && { parentId }),
      ...(rootOnly && { parentId: null }),
    };

    const [total, categories] = await prisma.$transaction([
      prisma.category.count({ where }),
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          parent: { select: { id: true, name: true } },
          _count: { select: { children: true, products: true } },
        },
      }),
    ]);

    return { total, categories };
  }

  /**
   * Get the full category tree (nested)
   */
  static async getTree(activeOnly = true) {
    const cacheKey = CacheKeys.categoriesTree();
    
    if (activeOnly) {
      const cached = await CacheService.get<any>(cacheKey);
      if (cached) return cached;
    }

    const categories = await prisma.category.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { sortOrder: 'asc' },
    });

    // Build tree
    const categoryMap = new Map();
    const roots: any[] = [];

    // Initialize map
    for (const cat of categories) {
      categoryMap.set(cat.id, { ...cat, children: [] });
    }

    // Build hierarchy
    for (const cat of categories) {
      const node = categoryMap.get(cat.id);
      if (node.parentId) {
        const parent = categoryMap.get(node.parentId);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        roots.push(node);
      }
    }

    if (activeOnly) {
      await CacheService.set(cacheKey, roots, TTL.CATEGORIES_TREE);
    }

    return roots;
  }

  /**
   * Create a new category
   */
  static async create(
    data: { name: string; description?: string; imageUrl?: string; parentId?: string; sortOrder?: number; isActive?: boolean },
    adminUserId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    if (data.parentId) {
      const parent = await prisma.category.findUnique({ where: { id: data.parentId } });
      if (!parent) throw new NotFoundError('Parent Category', data.parentId);
      if (parent.parentId) {
        // We only allow 2 levels of nesting (Root -> Child)
        throw new BadRequestError('Categories can only be nested one level deep (Root -> Child)');
      }
    }

    const baseSlug = slugify(data.name);
    const slug = await generateUniqueSlug(baseSlug, async (s) => {
      const exists = await prisma.category.findUnique({ where: { slug: s } });
      return !!exists;
    });

    const category = await prisma.$transaction(async (tx :any) => {
      const created = await tx.category.create({
        data: {
          ...data,
          slug,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'CATEGORY_CREATED', // Using string instead of enum if not defined, but ideally AuditAction.CATEGORY_CREATED
          resource: 'category',
          resourceId: created.id,
          newValues: data as any,
          ipAddress,
          userAgent,
        },
      });

      return created;
    });

    await CacheService.del(CacheKeys.categoriesTree());
    return category;
  }

  /**
   * Update a category
   */
  static async update(
    id: string,
    data: { name?: string; description?: string; imageUrl?: string; parentId?: string; sortOrder?: number; isActive?: boolean },
    adminUserId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundError('Category', id);

    if (data.parentId && data.parentId !== category.parentId) {
      if (data.parentId === id) throw new BadRequestError('Category cannot be its own parent');
      
      const parent = await prisma.category.findUnique({ where: { id: data.parentId } });
      if (!parent) throw new NotFoundError('Parent Category', data.parentId);
      
      // Prevent nesting more than 1 level
      if (parent.parentId) throw new BadRequestError('Categories can only be nested one level deep (Root -> Child)');
      
      // Prevent making a parent a child if it already has children
      const hasChildren = await prisma.category.count({ where: { parentId: id } });
      if (hasChildren > 0) throw new BadRequestError('Cannot move a category that has children. Remove its children first.');
    }

    let slug = category.slug;
    if (data.name && data.name !== category.name) {
      const baseSlug = slugify(data.name);
      slug = await generateUniqueSlug(baseSlug, async (s) => {
        const exists = await prisma.category.findFirst({ where: { slug: s, id: { not: id } } });
        return !!exists;
      });
    }

    const updatedCategory = await prisma.$transaction(async (tx :any) => {
      const updated = await tx.category.update({
        where: { id },
        data: {
          ...data,
          ...(data.name && { slug }),
        },
      });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'CATEGORY_UPDATED',
          resource: 'category',
          resourceId: id,
          oldValues: { name: category.name, parentId: category.parentId, isActive: category.isActive },
          newValues: data as any,
          ipAddress,
          userAgent,
        },
      });

      return updated;
    });

    await CacheService.del(CacheKeys.categoriesTree());
    return updatedCategory;
  }

  /**
   * Delete a category
   */
  static async delete(id: string, adminUserId: string, ipAddress?: string, userAgent?: string) {
    const category = await prisma.category.findUnique({ 
      where: { id },
      include: { _count: { select: { children: true, products: true } } }
    });
    
    if (!category) throw new NotFoundError('Category', id);
    if (category._count.children > 0) throw new ConflictError('Cannot delete a category with subcategories');
    if (category._count.products > 0) throw new ConflictError('Cannot delete a category with products');

    await prisma.$transaction(async (tx :any) => {
      await tx.category.delete({ where: { id } }); // Will be soft deleted by middleware
      
      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'CATEGORY_DELETED',
          resource: 'category',
          resourceId: id,
          ipAddress,
          userAgent,
        },
      });
    });

    await CacheService.del(CacheKeys.categoriesTree());
  }
}
