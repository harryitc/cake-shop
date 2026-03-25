import { httpClient } from "@/lib/http";
import { IOrderDTO, IUpdateStatusPayload } from "./types";

export const orderApi = {
  getAll: () => httpClient<{ items: IOrderDTO[]; total: number }>("/orders", { method: "GET" }),
  updateStatus: ({ id, payload }: { id: string; payload: IUpdateStatusPayload }) => 
    httpClient(`/orders/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
};
