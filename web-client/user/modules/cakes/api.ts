import { httpClient } from "@/lib/http";
import { ICakeDTO } from "./types";

export const cakeApi = {
  getAll: (search?: string) => {
    let url = "/cakes";
    if (search) url += `?search=${encodeURIComponent(search)}`;
    return httpClient<{ items: ICakeDTO[]; total: number }>(url, { method: "GET" });
  },
  getById: (id: string): Promise<ICakeDTO> => {
    return httpClient(`/cakes/${id}`, { method: "GET" });
  },
};
