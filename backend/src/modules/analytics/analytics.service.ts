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
      totalCustomers,
      totalStaff,
      totalAdmins,
      newUsers,
      totalOrders,
      totalRevenue,
      recentOrders,
      topProducts
    ] = await prisma.$transaction([
      prisma.user.count(),
      prisma.user.count({ where: { role: { name: 'CUSTOMER' } } }),
      prisma.user.count({ where: { role: { name: { in: ['PRODUCT_MANAGER', 'CUSTOMER_SUPPORT'] } } } }),
      prisma.user.count({ where: { role: { name: { in: ['ADMIN', 'SUPER_ADMIN'] } } } }),
      
      prisma.user.count({
        where: {
          role: { name: 'CUSTOMER' },
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
        totalCustomers,
        totalStaff,
        totalAdmins,
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

  /**
   * Get product-focused dashboard metrics for Product Managers
   */
  static async getProductDashboardMetrics(startDate?: Date, endDate?: Date) {
    const dateFilter = {
      ...(startDate && { gte: startDate }),
      ...(endDate && { lte: endDate }),
    };
    const hasDateFilter = startDate || endDate;

    const [
      totalProducts,
      totalCategories,
      topProducts,
      productsByCategory,
      lowStockResult
    ] = await prisma.$transaction([
      prisma.product.count({
        where: { ...(hasDateFilter && { createdAt: dateFilter }) }
      }),

      prisma.category.count(),

      prisma.orderItem.groupBy({
        by: ['productName'],
        _sum: { quantity: true, totalPrice: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10,
        where: {
          order: {
            status: { not: 'CANCELLED' },
            ...(hasDateFilter && { createdAt: dateFilter })
          }
        }
      }),

      prisma.product.groupBy({
        by: ['categoryId'],
        _count: { id: true },
        where: { ...(hasDateFilter && { createdAt: dateFilter }) }
      }),

      prisma.$queryRaw<{count: number}[]>`
        SELECT CAST(COUNT(*) AS INTEGER) as count 
        FROM inventory 
        WHERE quantity <= low_stock_threshold
      `
    ]);

    // Fetch categories to map the names
    const categories = await prisma.category.findMany({ select: { id: true, name: true } });
    const categoryMap = categories.reduce((acc: any, cat) => {
      acc[cat.id] = cat.name;
      return acc;
    }, {});

    return {
      overview: {
        totalProducts,
        totalCategories,
        lowStockVariants: Number(lowStockResult[0]?.count || 0)
      },
      topProducts: topProducts.map((p: any) => ({
        name: p.productName,
        sold: p._sum.quantity,
        revenue: p._sum.totalPrice
      })),
      productsByCategory: productsByCategory.map((p: any) => ({
        categoryName: categoryMap[p.categoryId] || 'Unknown',
        count: p._count.id
      }))
    };
  }

  /**
   * Get support dashboard metrics
   */
  static async getSupportMetrics(userId: string) {
    const [
      totalOpenTickets,
      unassignedTickets,
      myOpenTickets,
      recentTickets
    ] = await prisma.$transaction([
      prisma.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      prisma.supportTicket.count({ where: { status: 'OPEN', assignedTo: null } }),
      prisma.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] }, assignedTo: userId } }),
      prisma.supportTicket.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
        include: { user: { select: { email: true } } }
      })
    ]);

    // Calculate SLA breaches (open for more than 24h)
    const slaDate = new Date();
    slaDate.setHours(slaDate.getHours() - 24);
    const slaBreaches = await prisma.supportTicket.count({
      where: {
        status: { in: ['OPEN', 'IN_PROGRESS'] },
        createdAt: { lt: slaDate }
      }
    });

    return {
      overview: {
        totalOpenTickets,
        unassignedTickets,
        myOpenTickets,
        slaBreaches
      },
      recentTickets: recentTickets.map((t: any) => ({
        id: t.id,
        subject: t.subject,
        status: t.status,
        customerEmail: t.user?.email || 'Unknown',
        assignedTo: t.assignedTo || 'Unassigned',
        updatedAt: t.updatedAt
      }))
    };
  }

  /**
   * Get Admin financial charts data (revenue, income vs refunds)
   */
  static async getAdminCharts(timeframe: 'day' | 'month' | 'year' = 'day') {
    const now = new Date();
    let startDate = new Date();

    if (timeframe === 'day') {
      startDate.setDate(now.getDate() - 7);
    } else if (timeframe === 'month') {
      startDate.setDate(now.getDate() - 30);
    } else {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    const [orders, refunds] = await prisma.$transaction([
      prisma.order.findMany({
        where: {
          createdAt: { gte: startDate },
          status: { not: 'CANCELLED' }
        },
        select: { createdAt: true, total: true }
      }),
      prisma.refundRequest.findMany({
        where: {
          createdAt: { gte: startDate },
          status: { in: ['APPROVED', 'COMPLETED', 'PENDING'] }
        },
        select: { createdAt: true, amount: true }
      })
    ]);

    const getGroupKey = (d: Date) => {
      if (timeframe === 'day') {
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      } else if (timeframe === 'month') {
        return `Week ${Math.ceil(d.getDate() / 7)} (${d.toLocaleDateString('en-US', { month: 'short' })})`;
      } else {
        return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
    };

    const map: Record<string, { income: number; refund: number; minTime: number }> = {};

    orders.forEach((o) => {
      const key = getGroupKey(o.createdAt);
      if (!map[key]) map[key] = { income: 0, refund: 0, minTime: o.createdAt.getTime() };
      map[key].income += Number(o.total);
      if (o.createdAt.getTime() < map[key].minTime) {
        map[key].minTime = o.createdAt.getTime();
      }
    });

    refunds.forEach((r) => {
      const key = getGroupKey(r.createdAt);
      if (!map[key]) map[key] = { income: 0, refund: 0, minTime: r.createdAt.getTime() };
      map[key].refund += Number(r.amount);
      if (r.createdAt.getTime() < map[key].minTime) {
        map[key].minTime = r.createdAt.getTime();
      }
    });

    const chartData = Object.keys(map)
      .map((label) => ({
        label,
        revenue: map[label].income,
        income: map[label].income,
        refund: -Math.abs(map[label].refund),
        refundPositive: map[label].refund,
        net: map[label].income - map[label].refund,
        minTime: map[label].minTime,
      }))
      .sort((a, b) => a.minTime - b.minTime);

    return { timeframe, chartData };
  }

  /**
   * Get Product Manager performance and inventory stock chart data
   */
  static async getProductCharts(timeframe: 'day' | 'month' | 'year' = 'day') {
    const now = new Date();
    let startDate = new Date();

    if (timeframe === 'day') {
      startDate.setDate(now.getDate() - 1);
    } else if (timeframe === 'month') {
      startDate.setDate(now.getDate() - 30);
    } else {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    const salesGrouped = await prisma.orderItem.groupBy({
      by: ['productName'],
      _sum: { quantity: true, totalPrice: true },
      where: {
        order: {
          status: { not: 'CANCELLED' },
          createdAt: { gte: startDate }
        }
      },
      orderBy: {
        _sum: { quantity: 'desc' }
      }
    });

    const productSalesPerformance = salesGrouped
      .filter((p) => (p._sum.quantity || 0) > 0)
      .map((p) => ({
        name: p.productName,
        quantitySold: p._sum.quantity || 0,
        revenue: Number(p._sum.totalPrice || 0)
      }));

    const categories = await prisma.category.findMany({
      include: {
        products: {
          include: {
            variants: {
              include: {
                inventory: true
              }
            }
          }
        }
      }
    });

    const categoryInventory = categories.map((cat) => {
      let totalStock = 0;
      cat.products.forEach((prod) => {
        prod.variants.forEach((v) => {
          if (v.inventory) {
            totalStock += v.inventory.quantity;
          }
        });
      });
      return {
        categoryName: cat.name,
        totalStock,
        productCount: cat.products.length
      };
    });

    return {
      timeframe,
      productSalesPerformance,
      categoryInventory
    };
  }

  /**
   * Get Customer Support ticket charts data
   */
  static async getSupportCharts(timeframe: 'day' | 'month' | 'year' = 'day') {
    const now = new Date();
    let startDate = new Date();

    if (timeframe === 'day') {
      startDate.setDate(now.getDate() - 7);
    } else if (timeframe === 'month') {
      startDate.setDate(now.getDate() - 30);
    } else {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    const tickets = await prisma.supportTicket.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      select: { createdAt: true, category: true, status: true }
    });

    const categoryCounts: Record<string, number> = {};
    tickets.forEach((t) => {
      const cat = t.category || 'General Query';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const categoryDistribution = Object.keys(categoryCounts).map((category) => ({
      category,
      count: categoryCounts[category]
    }));

    const getGroupKey = (d: Date) => {
      if (timeframe === 'day') {
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      } else if (timeframe === 'month') {
        return `Week ${Math.ceil(d.getDate() / 7)} (${d.toLocaleDateString('en-US', { month: 'short' })})`;
      } else {
        return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
    };

    const timelineMap: Record<string, { open: number; resolved: number; minTime: number }> = {};
    tickets.forEach((t) => {
      const key = getGroupKey(t.createdAt);
      if (!timelineMap[key]) timelineMap[key] = { open: 0, resolved: 0, minTime: t.createdAt.getTime() };
      if (t.status === 'RESOLVED' || t.status === 'CLOSED') {
        timelineMap[key].resolved += 1;
      } else {
        timelineMap[key].open += 1;
      }
      if (t.createdAt.getTime() < timelineMap[key].minTime) {
        timelineMap[key].minTime = t.createdAt.getTime();
      }
    });

    const ticketTimeline = Object.keys(timelineMap)
      .map((label) => ({
        label,
        openTickets: timelineMap[label].open,
        resolvedTickets: timelineMap[label].resolved,
        totalTickets: timelineMap[label].open + timelineMap[label].resolved,
        minTime: timelineMap[label].minTime,
      }))
      .sort((a, b) => a.minTime - b.minTime);

    return {
      timeframe,
      ticketTimeline,
      categoryDistribution
    };
  }
}
