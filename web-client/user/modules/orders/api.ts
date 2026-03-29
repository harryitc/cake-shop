import { httpClient } from "@/lib/http";
import { IOrderDTO, ICreateOrderPayload } from "./types";

export const orderApi = {
  create: (payload: ICreateOrderPayload) =>
    httpClient.post<{ order: IOrderDTO }>("/orders", payload) as any,
    
  getMyOrders: () => 
    httpClient.get<{ items: IOrderDTO[] }>("/orders") as any,

  validateCoupon: (code: string) =>
    httpClient.post<any>("/coupons/validate", { code }) as any,
};
