import { httpClient } from "@/lib/http";
import { ICakeDTO, ICreateCakePayload, IUpdateCakePayload } from "./types";

export const cakeApi = {
  getAll: (search?: string) => {
    return httpClient.get<{ items: ICakeDTO[]; total: number }>("/cakes", {
      params: { search }
    }) as any;
  },
  
  getById: (id: string) => 
    httpClient.get<ICakeDTO>(`/cakes/${id}`) as any,
    
  create: (payload: ICreateCakePayload) => 
    httpClient.post("/cakes", payload) as any,
    
  update: ({ id, payload }: { id: string; payload: IUpdateCakePayload }) => 
    httpClient.put(`/cakes/${id}`, payload) as any,
    
  delete: (id: string) => 
    httpClient.delete(`/cakes/${id}`) as any,
    
  import: (file: File, mode: string = "UPSERT") => {
    const formData = new FormData();
    formData.append("file", file);
    return httpClient.post("/cakes/import", formData, {
      params: { mode },
      headers: {
        "Content-Type": "multipart/form-data",
      }
    }) as any;
  },
  
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return httpClient.post<{ path: string }>("/uploads", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      }
    }) as any;
  },

  uploadModel: (file: File) => {
    const formData = new FormData();
    formData.append("model", file);
    return httpClient.post<{ path: string }>("/uploads/model", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      }
    }) as any;
  },
};
