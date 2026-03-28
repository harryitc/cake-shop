import { httpClient } from "@/lib/http";
import { IOrderDTO, IUpdateStatusPayload } from "./types";

export const orderApi = {
  getAll: (params?: { userId?: string }) => {
    let url = "/orders";
    if (params?.userId) {
      url += `?userId=${params.userId}`;
    }
    return httpClient<{ items: IOrderDTO[]; total: number }>(url, { method: "GET" });
  },
  updateStatus: ({ id, payload }: { id: string; payload: IUpdateStatusPayload }) =>
    httpClient(`/orders/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
};
