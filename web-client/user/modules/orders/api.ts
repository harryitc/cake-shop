import { httpClient } from "@/lib/http";
import { IOrderDTO, ICreateOrderPayload } from "./types";

export const orderApi = {
  create: (payload: ICreateOrderPayload) =>
    httpClient.post<{ order: IOrderDTO }>("/orders", payload),
    
  getMyOrders: () => 
    httpClient.get<{ items: IOrderDTO[] }>("/orders"),

  validateCoupon: (code: string, order_value: number) =>
    httpClient.post<any>("/coupons/validate", { code, order_value }),
};
