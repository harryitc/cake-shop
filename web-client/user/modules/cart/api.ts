import { httpClient } from "@/lib/http";
import { ICartResponse } from "./types";

export const cartApi = {
  getCart: () => httpClient.get<ICartResponse>("/cart") as any,
  
  addItem: (payload: { cake_id: string; quantity: number; variant_id?: string | null }) =>
    httpClient.post("/cart/items", payload) as any,
    
  syncCart: (payload: Array<{ cake_id: string; quantity: number; variant_id?: string | null }>) =>
    httpClient.post("/cart/sync", payload) as any,
    
  removeItem: (id: string) =>
    httpClient.delete(`/cart/items/${id}`) as any,
    
  updateQuantity: (id: string, quantity: number) =>
    httpClient.put(`/cart/items/${id}`, { quantity }) as any,
};
