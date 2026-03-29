import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "./api";
import { mapCartToModel } from "./mapper";
import { authStorage } from "@/lib/http";

export const useIsLoggedIn = () => {
  return !!authStorage.getToken();
};

export const useCartQuery = () => {
  const isLoggedIn = useIsLoggedIn();
  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const data = await cartApi.getCart();
      return mapCartToModel(data);
    },
    enabled: isLoggedIn,
  });
};

export const useAddToCartMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cartApi.addItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

export const useRemoveFromCartMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cartApi.removeItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

export const useUpdateCartQuantityMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      cartApi.updateQuantity(id, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};
