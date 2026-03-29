import { httpClient } from "@/lib/http";
import { IOrderDTO, IUpdateOrderPayload } from "./types";

export const orderApi = {
  getAll: (page: number = 1, limit: number = 10, search?: string) => {
    return httpClient.get<{ items: IOrderDTO[]; total: number }>("/orders", {
      params: { page, limit, search }
    });
  },
  
  updateStatus: (id: string, payload: IUpdateOrderPayload) =>
    httpClient.put(`/orders/${id}`, payload),
};
