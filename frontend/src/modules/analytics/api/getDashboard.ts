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
    totalStaff: number;
    totalAdmins: number;
  };
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    total: string;
    customerEmail: string;
    createdAt: string;
  }>;
  topProducts: Array<{
    name: string;
    sold: number;
    revenue: string;
  }>;
}

export interface SupportDashboardData {
  overview: {
    totalOpenTickets: number;
    unassignedTickets: number;
    myOpenTickets: number;
    slaBreaches: number;
  };
  recentTickets: Array<{
    id: string;
    subject: string;
    status: string;
    customerEmail: string;
    assignedTo: string;
    updatedAt: string;
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

export async function getSupportDashboard(): Promise<SupportDashboardData> {
  const res = await api.get("/analytics/support-dashboard");
  return res.data.data;
}
