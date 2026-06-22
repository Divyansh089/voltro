import type { Request, Response } from 'express';
import { CmsService } from './cms.service';
import { sendSuccess, sendCreated } from '../../common/responses';
import { HttpStatus } from '../../common/enums';

export class CmsController {
  // ── Public Endpoints ─────────────────────────────────────

  static async getBannersPublic(req: Request, res: Response) {
    const banners = await CmsService.findBanners(false);
    res.status(HttpStatus.OK).json(sendSuccess(banners));
  }

  static async getFeaturedProductsPublic(req: Request, res: Response) {
    const products = await CmsService.findFeaturedProducts(false);
    res.status(HttpStatus.OK).json(sendSuccess(products));
  }

  static async getCampaignsPublic(req: Request, res: Response) {
    const campaigns = await CmsService.findCampaigns(false);
    res.status(HttpStatus.OK).json(sendSuccess(campaigns));
  }

  // ── Admin Endpoints ─────────────────────────────────────

  // Banners
  static async getBannersAdmin(req: Request, res: Response) {
    const banners = await CmsService.findBanners(true);
    res.status(HttpStatus.OK).json(sendSuccess(banners));
  }

  static async createBanner(req: Request, res: Response) {
    const adminUserId = (req as any).user.userId;
    const banner = await CmsService.createBanner(req.body, adminUserId, req.ip as string, req.get('user-agent') as string);
    res.status(HttpStatus.CREATED).json(sendCreated(banner));
  }

  static async updateBanner(req: Request, res: Response) {
    const adminUserId = (req as any).user.userId;
    const banner = await CmsService.updateBanner(req.params.id as string , req.body, adminUserId, req.ip as string, req.get('user-agent') as string);
    res.status(HttpStatus.OK).json(sendSuccess(banner));
  }

  static async deleteBanner(req: Request, res: Response) {
    const adminUserId = (req as any).user.userId;
    await CmsService.deleteBanner(req.params.id as string , adminUserId, req.ip as string, req.get('user-agent') as string);
    res.status(HttpStatus.NO_CONTENT).send();
  }

  // Featured Products
  static async getFeaturedProductsAdmin(req: Request, res: Response) {
    const products = await CmsService.findFeaturedProducts(true);
    res.status(HttpStatus.OK).json(sendSuccess(products));
  }

  static async createFeaturedProduct(req: Request, res: Response) {
    const adminUserId = (req as any).user.userId;
    const product = await CmsService.createFeaturedProduct(req.body, adminUserId, req.ip as string, req.get('user-agent') as string);
    res.status(HttpStatus.CREATED).json(sendCreated(product));
  }

  static async updateFeaturedProduct(req: Request, res: Response) {
    const adminUserId = (req as any).user.userId;
    const product = await CmsService.updateFeaturedProduct(req.params.id as string , req.body, adminUserId, req.ip as string, req.get('user-agent') as string);
    res.status(HttpStatus.OK).json(sendSuccess(product));
  }

  static async deleteFeaturedProduct(req: Request, res: Response) {
    const adminUserId = (req as any).user.userId;
    await CmsService.deleteFeaturedProduct(req.params.id as string , adminUserId, req.ip as string, req.get('user-agent') as string);
    res.status(HttpStatus.NO_CONTENT).send();
  }

  // Campaigns
  static async getCampaignsAdmin(req: Request, res: Response) {
    const campaigns = await CmsService.findCampaigns(true);
    res.status(HttpStatus.OK).json(sendSuccess(campaigns));
  }

  static async createCampaign(req: Request, res: Response) {
    const adminUserId = (req as any).user.userId;
    const campaign = await CmsService.createCampaign(req.body, adminUserId, req.ip as string, req.get('user-agent') as string);
    res.status(HttpStatus.CREATED).json(sendCreated(campaign));
  }

  static async updateCampaign(req: Request, res: Response) {
    const adminUserId = (req as any).user.userId;
    const campaign = await CmsService.updateCampaign(req.params.id as string , req.body, adminUserId, req.ip as string, req.get('user-agent') as string);
    res.status(HttpStatus.OK).json(sendSuccess(campaign));
  }

  static async deleteCampaign(req: Request, res: Response) {
    const adminUserId = (req as any).user.userId;
    await CmsService.deleteCampaign(req.params.id as string , adminUserId, req.ip as string, req.get('user-agent') as string);
    res.status(HttpStatus.NO_CONTENT).send();
  }
}
