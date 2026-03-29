import { httpClient } from "../lib/http";
import { Cake } from "../types/cake";

export const cakeService = {
  getAll: () => httpClient.get<Cake[]>("/cakes"),
  getById: (id: string) => httpClient.get<Cake>(`/cakes/${id}`),
};
