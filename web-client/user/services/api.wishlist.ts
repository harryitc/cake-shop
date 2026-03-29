import { httpClient } from "../lib/http";
import { Wishlist } from "../types/wishlist";

export const wishlistService = {
  getWishlist: () => httpClient.get<Wishlist>("/wishlist"),
  toggleWishlist: (cake_id: string) => httpClient.post<Wishlist>("/wishlist/toggle", { cake_id }),
};
