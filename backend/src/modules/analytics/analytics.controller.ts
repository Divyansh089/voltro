import type { Request, Response } from 'express';
import { AnalyticsService } from './analytics.service';
import { sendSuccess } from '../../common/responses';
import { HttpStatus } from '../../common/enums';

export class AnalyticsController {
  static async getDashboard(req: Request, res: Response) {
    const query = req.query as any;
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    const data = await AnalyticsService.getDashboardMetrics(startDate, endDate);
    res.status(HttpStatus.OK).json(sendSuccess(data));
  }

  static async getSalesChart(req: Request, res: Response) {
    const query = req.query as any;
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    const data = await AnalyticsService.getSalesChart(startDate, endDate);
    res.status(HttpStatus.OK).json(sendSuccess(data));
  }

  static async getProductDashboard(req: Request, res: Response) {
    const query = req.query as any;
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    const data = await AnalyticsService.getProductDashboardMetrics(startDate, endDate);
    res.status(HttpStatus.OK).json(sendSuccess(data));
  }
}
