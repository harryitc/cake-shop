import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "./api";
import { mapOrderToModel } from "./mapper";

export const useOrdersQuery = (params?: { page?: number; limit?: number; search?: string; userId?: string }) => {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: async () => {
      const { items, total } = await orderApi.getAll(params);
      return { 
        items: (items || []).map(mapOrderToModel), 
        total: total || 0 
      };
    },
  });
};

export const useUpdateOrderStatusMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => orderApi.updateStatus(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
};
