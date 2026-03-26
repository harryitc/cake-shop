import { httpClient } from "../lib/http";
import type { Cake } from "../types";

export interface Wishlist {
  user_id: string;
  cakes: Cake[];
}

export const wishlistService = {
  getWishlist: () => httpClient<Wishlist>("/wishlist"),
  toggleWishlist: (cake_id: string) => httpClient<Wishlist>("/wishlist/toggle", {
    method: "POST",
    body: JSON.stringify({ cake_id }),
  }),
};
