export interface IAnalyticsResponse {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    totalCakes: number;
    averageOrderValue: number;
  };
  orderDistribution: Array<{
    name: string;
    value: number;
  }>;
  bestSellers: Array<{
    name: string;
    image_url: string;
    price: number;
    soldQuantity: number;
    revenue: number;
  }>;
  revenueTimeline: Array<{
    date: string;
    revenue: number;
    orderCount: number;
  }>;
  categoryDistribution: Array<{
    name: string;
    value: number;
  }>;
  recentOrders: Array<{
    _id: string;
    user_id: {
      full_name: string;
      email: string;
    };
    total_price: number;
    status: string;
    createdAt: string;
  }>;
}
