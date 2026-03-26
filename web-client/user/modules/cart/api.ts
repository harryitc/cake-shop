import { httpClient } from "@/lib/http";
import { IAddToCartPayload, ICartResponse } from "./types";

export const cartApi = {
  getCart: () => httpClient<ICartResponse>("/cart", { method: "GET" }),
  addItem: (payload: IAddToCartPayload) => 
    httpClient("/cart/items", { method: "POST", body: JSON.stringify(payload) }),
  removeItem: (id: string) => 
    httpClient(`/cart/items/${id}`, { method: "DELETE" }),
  updateItemQuantity: (id: string, quantity: number) =>
    httpClient(`/cart/items/${id}`, { method: "PUT", body: JSON.stringify({ quantity }) }),
};
