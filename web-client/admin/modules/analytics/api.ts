import { httpClient } from "@/lib/http";

export interface IAnalyticsResponse {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    totalCakes: number;
    averageOrderValue: number;
  };
  orderDistribution: Array<{ name: string; value: number }>;
  bestSellers: Array<{ 
    name: string; 
    soldQuantity: number; 
    revenue: number;
    image_url?: string;
    price?: number;
  }>;
  revenueTimeline: Array<{ date: string; revenue: number; orderCount: number }>;
  categoryDistribution: Array<{ name: string; value: number }>;
  recentOrders: Array<{
    _id: string;
    total_price: number;
    status: string;
    createdAt: string;
    user_id: {
      full_name: string;
      email: string;
    };
  }>;
}

export const analyticsApi = {
  getStats: () => httpClient<IAnalyticsResponse>("/analytics/stats", { method: "GET" }),
};
