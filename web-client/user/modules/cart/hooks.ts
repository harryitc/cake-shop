import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "./api";

// Chúng ta tính toán mapping trực tiếp trong UI để đơn giản hóa, 
// hoặc có thể mapping tại đây. 

export const useCartQuery = () => {
  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const data = await cartApi.getCart();
      return data; // Model raw để qua UI mapping cho tiện import
    },
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

export const useRemoveCartItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cartApi.removeItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};
