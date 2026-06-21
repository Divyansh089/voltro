import prisma from '../../prisma/prismaClient';

export class AnalyticsService {
  /**
   * Get main dashboard metrics
   */
  static async getDashboardMetrics(startDate?: Date, endDate?: Date) {
    const dateFilter = {
      ...(startDate && { gte: startDate }),
      ...(endDate && { lte: endDate }),
    };
    const hasDateFilter = startDate || endDate;

    const [
      totalUsers,
      newUsers,
      totalOrders,
      totalRevenue,
      recentOrders,
      topProducts
    ] = await prisma.$transaction([
      prisma.user.count({ where: { role: { name: 'Customer' } } }),
      
      prisma.user.count({
        where: {
          role: { name: 'Customer' },
          ...(hasDateFilter && { createdAt: dateFilter })
        }
      }),

      prisma.order.count({
        where: {
          ...(hasDateFilter && { createdAt: dateFilter })
        }
      }),

      prisma.order.aggregate({
        where: {
          status: { not: 'CANCELLED' },
          ...(hasDateFilter && { createdAt: dateFilter })
        },
        _sum: { total: true }
      }),

      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true } } }
      }),

      prisma.orderItem.groupBy({
        by: ['productName'],
        _sum: { quantity: true, totalPrice: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
        where: {
          order: {
            status: { not: 'CANCELLED' },
            ...(hasDateFilter && { createdAt: dateFilter })
          }
        }
      })
    ]);

    return {
      overview: {
        totalUsers,
        newUsers,
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
      },
      recentOrders,
      topProducts: topProducts.map((p : any) => ({
        name: p.productName,
        sold: p._sum.quantity,
        revenue: p._sum.totalPrice
      }))
    };
  }

  /**
   * Get sales chart data (grouped by date)
   */
  static async getSalesChart(startDate?: Date, endDate?: Date) {
    // Note: Grouping by date in Prisma directly can be tricky across different DBs.
    // For simplicity, we fetch the relevant orders and group them in memory, or use raw SQL.
    // Given the constraints, we'll fetch basic data and map it. 
    // In a real prod with high volume, this should use raw SQL or a dedicated stats table.

    const orders = await prisma.order.findMany({
      where: {
        status: { not: 'CANCELLED' },
        ...(startDate || endDate ? {
          createdAt: {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate }),
          }
        } : {})
      },
      select: {
        createdAt: true,
        total: true,
      },
      orderBy: { createdAt: 'asc' }
    });

    const grouped: Record<string, number> = {};
    for (const order of orders) {
      const dateStr = order.createdAt.toISOString().split('T')[0];
      if (!grouped[dateStr]) grouped[dateStr] = 0;
      grouped[dateStr] += Number(order.total);
    }

    return Object.keys(grouped).map(date => ({
      date,
      revenue: grouped[date]
    }));
  }
}
