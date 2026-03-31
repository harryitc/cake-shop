import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "./api";
import { mapCartToModel } from "./mapper";
import { authStorage } from "@/lib/http";
import { getLocalCart, addToLocalCart, removeFromLocalCart, updateLocalCartItemQuantity, clearLocalCart } from "./local-cart";

export const useIsLoggedIn = () => {
  return !!authStorage.getToken();
};

export const useCartQuery = () => {
  const isLoggedIn = useIsLoggedIn();
  return useQuery({
    queryKey: ["cart", isLoggedIn],
    queryFn: async () => {
      if (isLoggedIn) {
        const data = await cartApi.getCart();
        return mapCartToModel(data);
      } else {
        return getLocalCart();
      }
    },
  });
};

export const useAddToCartMutation = () => {
  const queryClient = useQueryClient();
  const isLoggedIn = useIsLoggedIn();
  return useMutation({
    mutationFn: async (payload: { cake_id: string; quantity: number; variant_id?: string | null }) => {
      if (isLoggedIn) {
        return cartApi.addItem(payload);
      } else {
        return addToLocalCart(payload.cake_id, payload.quantity, payload.variant_id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

export const useAddSyncToCartMutation = () => {
  const queryClient = useQueryClient();
  const isLoggedIn = useIsLoggedIn();
  return useMutation({
    mutationFn: async (payload: { cake_id: string; quantity: number; variant_id?: string | null }[]) => {
      if (isLoggedIn) {
        return cartApi.syncCart(payload);
      } else {
        for (const item of payload) {
          addToLocalCart(item.cake_id, item.quantity, item.variant_id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

export const useRemoveFromCartMutation = () => {
  const queryClient = useQueryClient();
  const isLoggedIn = useIsLoggedIn();
  return useMutation({
    mutationFn: async (id: string) => {
      if (isLoggedIn) {
        return cartApi.removeItem(id);
      } else {
        return removeFromLocalCart(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

export const useUpdateCartQuantityMutation = () => {
  const queryClient = useQueryClient();
  const isLoggedIn = useIsLoggedIn();
  return useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      if (isLoggedIn) {
        return cartApi.updateQuantity(id, quantity);
      } else {
        return updateLocalCartItemQuantity(id, quantity);
      }
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
      const localCart = getLocalCart();
      if (localCart.items && localCart.items.length > 0) {
        const payload = localCart.items.map(item => ({
          cake_id: item.cake._id,
          quantity: item.quantity,
          variant_id: item.variant_id,
        }));
        await cartApi.syncCart(payload);
        clearLocalCart();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};
