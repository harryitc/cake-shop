import { httpClient } from "@/lib/http";
import { Coupon } from "./types";

export const couponApi = {
  getAll: () => httpClient.get<Coupon[]>("/coupons") as any,
  create: (data: any) => httpClient.post("/coupons", data) as any,
  update: (id: string, data: any) => httpClient.put(`/coupons/${id}`, data) as any,
  delete: (id: string) => httpClient.delete(`/coupons/${id}`) as any,
};
