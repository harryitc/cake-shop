import { httpClient } from "@/lib/http";
import { ICakeDTO } from "./types";

export interface GetCakesParams {
  search?: string;
  categories?: string[];
  min_price?: number;
  max_price?: number;
  sort?: string;
  limit?: number;
  page?: number;
}

export const cakeApi = {
  getAll: (params: GetCakesParams = {}) => {
    return httpClient.get<{ items: ICakeDTO[]; total: number }>("/cakes", {
      params: {
        ...params,
        limit: params.limit ?? 100,
        page: params.page ?? 1,
      }
    });
  },
  
  getById: (id: string): Promise<ICakeDTO> => {
    return httpClient.get(`/cakes/${id}`);
  },
  
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return httpClient.post<{ path: string }>("/uploads", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  createReview: (payload: { cake_id: string; order_id: string; rating: number; comment: string }) =>
    httpClient.post("/reviews", payload),
};
