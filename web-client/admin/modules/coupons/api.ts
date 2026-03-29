import { httpClient } from "@/lib/http";
import { Coupon } from "./types";

export const couponApi = {
  getAll: () => httpClient.get<Coupon[]>("/coupons"),
  create: (data: any) => httpClient.post("/coupons", data),
  update: (id: string, data: any) => httpClient.put(`/coupons/${id}`, data),
  delete: (id: string) => httpClient.delete(`/coupons/${id}`),
};
