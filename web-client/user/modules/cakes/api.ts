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
    const { search, categories, min_price, max_price, sort, limit = 100, page = 1 } = params;
    
    let url = `/cakes?limit=${limit}&page=${page}`;
    
    if (search) url += `&search=${encodeURIComponent(search)}`;
    
    if (categories && categories.length > 0) {
      // Backend hỗ trợ categories=id1&categories=id2
      categories.forEach(catId => {
        url += `&categories=${encodeURIComponent(catId)}`;
      });
    }
    
    if (min_price !== undefined) url += `&min_price=${min_price}`;
    if (max_price !== undefined) url += `&max_price=${max_price}`;
    if (sort) url += `&sort=${sort}`;
    
    return httpClient<{ items: ICakeDTO[]; total: number }>(url, { method: "GET" });
  },
  
  getById: (id: string): Promise<ICakeDTO> => {
    return httpClient(`/cakes/${id}`, { method: "GET" });
  },
  
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return httpClient<{ path: string }>("/uploads", {
      method: "POST",
      body: formData,
    });
  },
};
