import { httpClient } from "@/lib/http";
import { ICartResponse } from "./types";

export const cartApi = {
  getCart: () => httpClient.get<ICartResponse>("/cart"),
  
  addItem: (payload: { cake_id: string; quantity: number }) =>
    httpClient.post("/cart/items", payload),
    
  removeItem: (id: string) =>
    httpClient.delete(`/cart/items/${id}`),
    
  updateQuantity: (id: string, quantity: number) =>
    httpClient.put(`/cart/items/${id}`, { quantity }),
};
