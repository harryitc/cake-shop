import { httpClient } from "@/lib/http";
import { 
  ICustomerDTO, 
  IPointHistoryDTO, 
  IAdjustPointsPayload, 
  IGetCustomersParams, 
  IGetPointHistoryParams,
  ILoyaltyStats,
  ILoyaltyConfig,
  IRankOverridePayload
} from "../types";

export const customersService = {
  getCustomers: (params?: IGetCustomersParams) => {
    let url = "/loyalty/admin/customers";
    const query = new URLSearchParams();
    if (params) {
      if (params.page) query.append("page", params.page.toString());
      if (params.limit) query.append("limit", params.limit.toString());
      if (params.search) query.append("search", params.search);
      if (params.rank) query.append("rank", params.rank);
    }
    const queryString = query.toString();
    if (queryString) url += `?${queryString}`;
    
    return httpClient<{ items: ICustomerDTO[]; total: number }>(url, { method: "GET" });
  },

  getPointHistory: (userId: string, params?: IGetPointHistoryParams) => {
    let url = `/loyalty/admin/history/${userId}`;
    const query = new URLSearchParams();
    if (params) {
      if (params.page) query.append("page", params.page.toString());
      if (params.limit) query.append("limit", params.limit.toString());
    }
    const queryString = query.toString();
    if (queryString) url += `?${queryString}`;

    return httpClient<{ items: IPointHistoryDTO[]; total: number }>(url, { method: "GET" });
  },

  adjustPoints: (userId: string, payload: IAdjustPointsPayload) => {
    return httpClient<{ id: string; loyalty_points: number; rank: string }>(
      `/loyalty/admin/adjust-points/${userId}`, 
      { 
        method: "POST", 
        body: JSON.stringify(payload) 
      }
    );
  },

  getLoyaltyStats: () => {
    return httpClient<ILoyaltyStats>("/loyalty/admin/stats", { method: "GET" });
  },

  overrideRank: (userId: string, payload: IRankOverridePayload) => {
    return httpClient<{ id: string; rank: string; rank_lock: boolean }>(
      `/loyalty/admin/override-rank/${userId}`,
      {
        method: "POST",
        body: JSON.stringify(payload)
      }
    );
  },

  getLoyaltyConfig: () => {
    return httpClient<ILoyaltyConfig>("/loyalty/admin/config", { method: "GET" });
  },

  updateLoyaltyConfig: (payload: Partial<ILoyaltyConfig>) => {
    return httpClient<ILoyaltyConfig>("/loyalty/admin/config", {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  }
};
