import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "./api";
import { getLocalCart, addToLocalCart, removeFromLocalCart, updateLocalCartItemQuantity, clearLocalCart } from "./local-cart";

const isUserLoggedIn = () => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("access_token");
};

export const useCartQuery = () => {
  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      if (isUserLoggedIn()) {
        try {
          return await cartApi.getCart();
        } catch (err) {
          // Nếu lỗi 401 hoặc token hết hạn, fallback về local hoặc rỗng
          return { items: [], total: 0 };
        }
      }
      return getLocalCart();
    },
  });
};

export const useAddToCartMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ cake_id, quantity, variant_id }: { cake_id: string; quantity?: number; variant_id?: string | null }) => {
      if (isUserLoggedIn()) {
        return cartApi.addItem({ cake_id, quantity, variant_id });
      }
      return addToLocalCart(cake_id, quantity, variant_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

export const useRemoveCartItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (isUserLoggedIn()) {
        return cartApi.removeItem(id);
      }
      return removeFromLocalCart(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

export const useUpdateCartItemQuantityMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      if (isUserLoggedIn()) {
        return cartApi.updateItemQuantity(id, quantity);
      }
      return updateLocalCartItemQuantity(id, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

export const useSyncCartMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!isUserLoggedIn()) return;
      const localCart = getLocalCart();
      if (localCart.items.length === 0) return;

      // Sync từng item lên server
      for (const item of localCart.items) {
        await cartApi.addItem({ 
          cake_id: item.cake._id, 
          quantity: item.quantity, 
          variant_id: item.variant_id 
        });
      }
      
      clearLocalCart();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};
