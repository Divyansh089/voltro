import prisma from '../../prisma/prismaClient';
import { NotFoundError } from '../../common/errors';
import type { Prisma } from '@prisma/client';

export class CmsService {
  // ── Homepage Banners ─────────────────────────────────────

  static async findBanners(isAdmin = false) {
    const where: any = {};
    
    if (!isAdmin) {
      where.isActive = true;
      const now = new Date();
      where.OR = [
        { startsAt: null, endsAt: null },
        { startsAt: { lte: now }, endsAt: { gte: now } },
        { startsAt: { lte: now }, endsAt: null },
        { startsAt: null, endsAt: { gte: now } },
      ];
    }

    return await prisma.homepageBanner.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
  }

  static async createBanner(data: any, adminUserId: string, ipAddress?: string, userAgent?: string) {
    const banner = await prisma.$transaction(async (tx: any) => {
      const created = await tx.homepageBanner.create({ data });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'BANNER_CREATED',
          resource: 'homepage_banner',
          resourceId: created.id,
          newValues: data as any,
          ipAddress,
          userAgent,
        }
      });
      return created;
    });
    return banner;
  }

  static async updateBanner(id: string, data: any, adminUserId: string, ipAddress?: string, userAgent?: string) {
    const banner = await prisma.homepageBanner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundError('Banner', id);

    const updated = await prisma.$transaction(async (tx: any) => {
      const result = await tx.homepageBanner.update({ where: { id }, data });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'BANNER_UPDATED',
          resource: 'homepage_banner',
          resourceId: id,
          oldValues: banner as any,
          newValues: data as any,
          ipAddress,
          userAgent,
        }
      });
      return result;
    });
    return updated;
  }

  static async deleteBanner(id: string, adminUserId: string, ipAddress?: string, userAgent?: string) {
    const banner = await prisma.homepageBanner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundError('Banner', id);

    await prisma.$transaction(async (tx: any) => {
      await tx.homepageBanner.delete({ where: { id } });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'BANNER_DELETED',
          resource: 'homepage_banner',
          resourceId: id,
          ipAddress,
          userAgent,
        }
      });
    });
  }

  // ── Featured Products ────────────────────────────────────

  static async findFeaturedProducts(isAdmin = false) {
    const where: any = {};
    
    if (!isAdmin) {
      where.isActive = true;
      const now = new Date();
      where.OR = [
        { startsAt: null, endsAt: null },
        { startsAt: { lte: now }, endsAt: { gte: now } },
        { startsAt: { lte: now }, endsAt: null },
        { startsAt: null, endsAt: { gte: now } },
      ];
    }

    return await prisma.featuredProduct.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: {
        product: { select: { id: true, name: true, slug: true, basePrice: true, images: { where: { isPrimary: true }, take: 1 } } }
      }
    });
  }

  static async createFeaturedProduct(data: any, adminUserId: string, ipAddress?: string, userAgent?: string) {
    const featured = await prisma.$transaction(async (tx: any) => {
      const created = await tx.featuredProduct.create({ data });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'FEATURED_PRODUCT_CREATED',
          resource: 'featured_product',
          resourceId: created.id,
          newValues: data as any,
          ipAddress,
          userAgent,
        }
      });
      return created;
    });
    return featured;
  }

  static async updateFeaturedProduct(id: string, data: any, adminUserId: string, ipAddress?: string, userAgent?: string) {
    const featured = await prisma.featuredProduct.findUnique({ where: { id } });
    if (!featured) throw new NotFoundError('Featured Product', id);

    const updated = await prisma.$transaction(async (tx: any) => {
      const result = await tx.featuredProduct.update({ where: { id }, data });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'FEATURED_PRODUCT_UPDATED',
          resource: 'featured_product',
          resourceId: id,
          oldValues: featured as any,
          newValues: data as any,
          ipAddress,
          userAgent,
        }
      });
      return result;
    });
    return updated;
  }

  static async deleteFeaturedProduct(id: string, adminUserId: string, ipAddress?: string, userAgent?: string) {
    const featured = await prisma.featuredProduct.findUnique({ where: { id } });
    if (!featured) throw new NotFoundError('Featured Product', id);

    await prisma.$transaction(async (tx: any) => {
      await tx.featuredProduct.delete({ where: { id } });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'FEATURED_PRODUCT_DELETED',
          resource: 'featured_product',
          resourceId: id,
          ipAddress,
          userAgent,
        }
      });
    });
  }

  // ── Promotional Campaigns ────────────────────────────────

  static async findCampaigns(isAdmin = false) {
    const where: any = {};
    
    if (!isAdmin) {
      where.isActive = true;
      const now = new Date();
      where.OR = [
        { startsAt: null, endsAt: null },
        { startsAt: { lte: now }, endsAt: { gte: now } },
        { startsAt: { lte: now }, endsAt: null },
        { startsAt: null, endsAt: { gte: now } },
      ];
    }

    return await prisma.promotionalCampaign.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createCampaign(data: any, adminUserId: string, ipAddress?: string, userAgent?: string) {
    const campaign = await prisma.$transaction(async (tx: any) => {
      const created = await tx.promotionalCampaign.create({ data });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'CAMPAIGN_CREATED',
          resource: 'promotional_campaign',
          resourceId: created.id,
          newValues: data as any,
          ipAddress,
          userAgent,
        }
      });
      return created;
    });
    return campaign;
  }

  static async updateCampaign(id: string, data: any, adminUserId: string, ipAddress?: string, userAgent?: string) {
    const campaign = await prisma.promotionalCampaign.findUnique({ where: { id } });
    if (!campaign) throw new NotFoundError('Campaign', id);

    const updated = await prisma.$transaction(async (tx: any) => {
      const result = await tx.promotionalCampaign.update({ where: { id }, data });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'CAMPAIGN_UPDATED',
          resource: 'promotional_campaign',
          resourceId: id,
          oldValues: campaign as any,
          newValues: data as any,
          ipAddress,
          userAgent,
        }
      });
      return result;
    });
    return updated;
  }

  static async deleteCampaign(id: string, adminUserId: string, ipAddress?: string, userAgent?: string) {
    const campaign = await prisma.promotionalCampaign.findUnique({ where: { id } });
    if (!campaign) throw new NotFoundError('Campaign', id);

    await prisma.$transaction(async (tx: any) => {
      await tx.promotionalCampaign.delete({ where: { id } });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'CAMPAIGN_DELETED',
          resource: 'promotional_campaign',
          resourceId: id,
          ipAddress,
          userAgent,
        }
      });
    });
  }
}
