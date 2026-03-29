import { httpClient } from "@/lib/http";
import { ICakeDTO, ICreateCakePayload, IUpdateCakePayload } from "./types";

export const cakeApi = {
  getAll: (search?: string) => {
    return httpClient.get<{ items: ICakeDTO[]; total: number }>("/cakes", {
      params: { search }
    });
  },
  
  getById: (id: string) => 
    httpClient.get<ICakeDTO>(`/cakes/${id}`),
    
  create: (payload: ICreateCakePayload) => 
    httpClient.post("/cakes", payload),
    
  update: ({ id, payload }: { id: string; payload: IUpdateCakePayload }) => 
    httpClient.put(`/cakes/${id}`, payload),
    
  delete: (id: string) => 
    httpClient.delete(`/cakes/${id}`),
    
  import: (file: File, mode: string = "UPSERT") => {
    const formData = new FormData();
    formData.append("file", file);
    return httpClient.post("/cakes/import", formData, {
      params: { mode },
      headers: {
        "Content-Type": "multipart/form-data",
      }
    });
  },
  
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return httpClient.post<{ path: string }>("/uploads", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      }
    });
  },
};
