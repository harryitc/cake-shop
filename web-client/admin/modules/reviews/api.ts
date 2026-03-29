import { httpClient } from "@/lib/http";

export const reviewApi = {
  getAll: (page: number = 1, limit: number = 10) => 
    httpClient.get<any>("/reviews/admin", {
      params: { page, limit }
    }),
  updateStatus: (id: string, is_approved: boolean) => 
    httpClient.put(`/reviews/admin/${id}/status`, { is_approved }),
  reply: (id: string, reply: string) => 
    httpClient.put(`/reviews/admin/${id}/reply`, { reply }),
};
