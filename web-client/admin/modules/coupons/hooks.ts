import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { couponApi } from "./api";
import { mapCouponToModel } from "./mapper";

export const useCouponsQuery = () => {
  return useQuery({
    queryKey: ["coupons"],
    queryFn: async () => {
      const data = await couponApi.getAll();
      return data.map(mapCouponToModel);
    },
  });
};

export const useCreateCouponMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: couponApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coupons"] }),
  });
};

export const useUpdateCouponMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => couponApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coupons"] }),
  });
};

export const useDeleteCouponMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: couponApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coupons"] }),
  });
};
