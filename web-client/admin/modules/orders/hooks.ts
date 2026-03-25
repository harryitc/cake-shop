import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "./api";
import { mapOrderToModel } from "./mapper";

export const useOrdersQuery = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { items, total } = await orderApi.getAll();
      return { items: items.map(mapOrderToModel), total };
    },
  });
};

export const useUpdateOrderStatusMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: orderApi.updateStatus,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
};
