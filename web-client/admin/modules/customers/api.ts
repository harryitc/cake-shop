import { httpClient } from "@/lib/http";
import { ICustomerDTO, IPointHistoryDTO, ILoyaltyStats, ILoyaltyConfig, IRankOverridePayload } from "./types";

export const customersService = {
  getCustomers: (params: { page?: number; limit?: number; search?: string; rank?: string }) => {
    return httpClient.get<{ items: ICustomerDTO[]; total: number }>("/loyalty/admin/customers", {
      params
    }) as any;
  },

  getAll: (page: number = 1, limit: number = 10, search?: string) => {
    return httpClient.get<{ items: ICustomerDTO[]; total: number }>("/loyalty/admin/customers", {
      params: { page, limit, search }
    }) as any;
  },

  getPointHistory: (userId: string, params?: { page?: number; limit?: number }) => {
    return httpClient.get<{ items: IPointHistoryDTO[]; total: number }>(`/loyalty/admin/history/${userId}`, {
      params
    }) as any;
  },

  adjustPoints: (userId: string, points: number, reason: string) => {
    return httpClient.post<{ id: string; loyalty_points: number; rank: string }>(
      `/loyalty/admin/adjust-points/${userId}`,
      { points, reason }
    ) as any;
  },

  getLoyaltyStats: () => {
    return httpClient.get<ILoyaltyStats>("/loyalty/admin/stats") as any;
  },

  toggleRankLock: (userId: string, rank_lock: boolean) => {
    return httpClient.post<{ id: string; rank: string; rank_lock: boolean }>(
      `/loyalty/admin/rank-lock/${userId}`,
      { rank_lock }
    ) as any;
  },

  overrideRank: (userId: string, payload: IRankOverridePayload) => {
    return httpClient.post<{ id: string; rank: string; rank_lock: boolean }>(
      `/loyalty/admin/override-rank/${userId}`,
      payload
    ) as any;
  },

  getLoyaltyConfig: () => {
    return httpClient.get<ILoyaltyConfig>("/loyalty/admin/config") as any;
  },

  updateLoyaltyConfig: (config: Partial<ILoyaltyConfig>) => {
    return httpClient.put<ILoyaltyConfig>("/loyalty/admin/config", config) as any;
  },
};

