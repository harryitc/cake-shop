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
    // Axios tự động xử lý array params nếu được cấu hình đúng, 
    // tuy nhiên ở đây chúng ta giữ params nguyên bản để Axios tự serializes
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
};
