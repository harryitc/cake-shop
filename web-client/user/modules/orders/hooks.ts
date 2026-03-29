import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "./api";
import { mapOrderToModel } from "./mapper";

export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: orderApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useMyOrdersQuery = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await orderApi.getMyOrders();
      return (res.items || []).map(mapOrderToModel);
    },
  });
};
