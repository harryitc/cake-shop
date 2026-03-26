import { httpClient } from "@/lib/http";
import { ICakeDTO, ICreateCakePayload, IUpdateCakePayload } from "./types";

export const cakeApi = {
  getAll: (search?: string) => {
    let url = "/cakes";
    if (search) url += `?search=${encodeURIComponent(search)}`;
    return httpClient<{ items: ICakeDTO[]; total: number }>(url, { method: "GET" });
  },
  create: (payload: ICreateCakePayload) => 
    httpClient("/cakes", { method: "POST", body: JSON.stringify(payload) }),
  update: ({ id, payload }: { id: string; payload: IUpdateCakePayload }) => 
    httpClient(`/cakes/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  delete: (id: string) => 
    httpClient(`/cakes/${id}`, { method: "DELETE" }),
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return httpClient<{ path: string }>("/uploads", {
      method: "POST",
      body: formData,
    });
  },
};
