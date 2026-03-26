import { httpClient } from "@/lib/http";
import { ICakeDTO } from "./types";

export const cakeApi = {
  getAll: (search?: string, category?: string) => {
    let url = "/cakes?limit=100"; // Tăng limit để hiển thị nhiều hơn hoặc phân trang sau
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (category) url += `&category=${encodeURIComponent(category)}`;
    return httpClient<{ items: ICakeDTO[]; total: number }>(url, { method: "GET" });
  },
  getById: (id: string): Promise<ICakeDTO> => {
    return httpClient(`/cakes/${id}`, { method: "GET" });
  },
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    // User can upload avatar, though backend requireRole('admin') might need adjustment 
    // or we use same endpoint for simplicity if roles allow.
    // Actually, backend routes/upload.routes.js has requireRole('admin').
    // Let me check if users should be able to upload avatar.
    return httpClient<{ path: string }>("/uploads", {
      method: "POST",
      body: formData,
    });
  },
};
