import { httpClient } from "@/lib/http";

export interface IAnalyticsResponse {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    totalCakes: number;
  };
  orderDistribution: Array<{ name: string; value: number }>;
  bestSellers: Array<{ name: string; soldQuantity: number; revenue: number }>;
  revenueTimeline: Array<{ date: string; revenue: number; orderCount: number }>;
}

export const analyticsApi = {
  getStats: () => httpClient<IAnalyticsResponse>("/analytics/stats", { method: "GET" }),
};
