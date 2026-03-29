import { httpClient } from "@/lib/http";
import { IOrderDTO, IUpdateOrderPayload } from "./types";

export const orderApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; userId?: string }) => {
    return httpClient.get<{ items: IOrderDTO[]; total: number }>("/orders", {
      params
    }) as any;
  },
  
  updateStatus: (id: string, payload: IUpdateOrderPayload) =>
    httpClient.put(`/orders/${id}`, payload) as any,
};
