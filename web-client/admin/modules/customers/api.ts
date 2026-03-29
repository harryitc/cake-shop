import { httpClient } from "@/lib/http";
import { ICustomerDTO, IPointHistoryDTO, ILoyaltyStats, ILoyaltyConfig } from "../types";

export const customersService = {
  getAll: (page: number = 1, limit: number = 10, search?: string) => {
    return httpClient.get<{ items: ICustomerDTO[]; total: number }>("/users", {
      params: { page, limit, search }
    });
  },

  getPointHistory: (userId: string, page: number = 1, limit: number = 10) => {
    return httpClient.get<{ items: IPointHistoryDTO[]; total: number }>(`/loyalty/admin/history/${userId}`, {
      params: { page, limit }
    });
  },

  adjustPoints: (userId: string, points: number, reason: string) => {
    return httpClient.post<{ id: string; loyalty_points: number; rank: string }>(
      `/loyalty/admin/adjust-points/${userId}`,
      { points, reason }
    );
  },

  getLoyaltyStats: () => {
    return httpClient.get<ILoyaltyStats>("/loyalty/admin/stats");
  },

  toggleRankLock: (userId: string, rank_lock: boolean) => {
    return httpClient.post<{ id: string; rank: string; rank_lock: boolean }>(
      `/loyalty/admin/rank-lock/${userId}`,
      { rank_lock }
    );
  },

  getLoyaltyConfig: () => {
    return httpClient.get<ILoyaltyConfig>("/loyalty/admin/config");
  },

  updateLoyaltyConfig: (config: Partial<ILoyaltyConfig>) => {
    return httpClient.put<ILoyaltyConfig>("/loyalty/admin/config", config);
  },
};
