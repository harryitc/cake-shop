import { useQuery, useMutation } from "@tanstack/react-query";
import { cakeApi, GetCakesParams } from "./api";
import { mapCakeToModel } from "./mapper";
import { httpClient } from "@/lib/http";

export const useCakesQuery = (params: GetCakesParams = {}) => {
  return useQuery({
    queryKey: ["cakes", params],
    queryFn: async () => {
      const { items, total } = await cakeApi.getAll(params);
      return { items: items.map(mapCakeToModel), total };
    },
  });
};

export const useCakeQuery = (id: string) => {
  return useQuery({
    queryKey: ["cakes", id],
    queryFn: async () => {
      const cake = await cakeApi.getById(id);
      return mapCakeToModel(cake);
    },
    enabled: !!id,
  });
};

export const useCakeReviewsQuery = (cakeId: string, page: number = 1) => {
  return useQuery({
    queryKey: ["cake-reviews", cakeId, page],
    queryFn: async () => {
      const res = await httpClient<{ items: any[]; total: number; limit: number }>(`/reviews/cake/${cakeId}?page=${page}`, { method: "GET" });
      return res;
    },
    enabled: !!cakeId,
  });
};

export const useUploadImageMutation = () => {
  return useMutation({
    mutationFn: cakeApi.uploadImage,
  });
};
