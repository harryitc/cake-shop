// File Export các hàm gọi API Fetch/Axios. Nhiệm vụ chỉ là Call và lấy Data, không dính líu đến React lifecycle hoặc State.
import { httpClient } from "../lib/http";
import type { Cake } from "../types";

export const cakeService = {
  getAll: () => httpClient<Cake[]>("/cakes"),
  getById: (id: string) => httpClient<Cake>(`/cakes/${id}`),
};
