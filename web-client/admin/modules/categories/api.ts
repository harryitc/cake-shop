import { httpClient } from "@/lib/http";
import { Category } from "./types";

export const categoryApi = {
  getAll: () => httpClient.get<Category[]>("/categories"),
  create: (data: any) => httpClient.post("/categories", data),
  update: (id: string, data: any) => httpClient.put(`/categories/${id}`, data),
  delete: (id: string) => httpClient.delete(`/categories/${id}`),
};
