import api from "@/services/axios";

export interface ProductDashboardData {
  overview: {
    totalProducts: number;
    totalCategories: number;
    lowStockVariants: number;
  };
  topProducts: Array<{
    name: string;
    sold: number;
    revenue: string;
  }>;
  productsByCategory: Array<{
    categoryName: string;
    count: number;
  }>;
}

export interface AdminDashboardData {
  overview: {
    totalUsers: number;
    newUsers: number;
    totalOrders: number;
    totalRevenue: string;
    totalCustomers: number;
    totalProductManagers: number;
    totalAdmins: number;
  };
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    total: string;
    createdAt: string;
  }>;
}

export async function getProductDashboard(): Promise<ProductDashboardData> {
  const res = await api.get("/analytics/products-dashboard");
  return res.data.data;
}

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const res = await api.get("/analytics/dashboard");
  return res.data.data;
}
