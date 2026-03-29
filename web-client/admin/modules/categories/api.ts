import { httpClient } from "@/lib/http";
import { Category } from "./types";

export const categoryApi = {
  getAll: () => httpClient.get<Category[]>("/categories") as any,
  create: (data: any) => httpClient.post("/categories", data) as any,
  update: (id: string, data: any) => httpClient.put(`/categories/${id}`, data) as any,
  delete: (id: string) => httpClient.delete(`/categories/${id}`) as any,
};
