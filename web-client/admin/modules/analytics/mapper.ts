import { IAnalyticsResponse } from "./types";

export const mapAnalyticsToModel = (dto: IAnalyticsResponse) => {
  return {
    totalRevenue: dto.totalRevenue,
    totalOrders: dto.totalOrders,
    totalCakes: dto.totalCakes,
    totalCustomers: dto.totalCustomers,
    revenueByDay: dto.revenueByDay.map(item => ({
      date: item._id,
      revenue: item.total
    })),
    topSellingCakes: dto.topSellingCakes.map(item => ({
      name: item.cakeInfo.name,
      totalSold: item.totalSold,
      revenue: item.revenue
    })),
    orderStatusStats: dto.orderStatusStats.map(item => ({
      status: item._id,
      count: item.count
    }))
  };
};

export type AnalyticsModel = ReturnType<typeof mapAnalyticsToModel>;
