import { useQuery, useMutation } from "@tanstack/react-query";
import { cakeApi, GetCakesParams } from "./api";
import { mapCakeToModel, mapCategoryToModel, mapReviewToModel } from "./mapper";
import { httpClient } from "@/lib/http";

export const useCakesQuery = (params: GetCakesParams = {}) => {
  return useQuery({
    queryKey: ["cakes", params],
    queryFn: async () => {
      const { items, total } = await cakeApi.getAll(params);
      return { items: (items || []).map(mapCakeToModel), total: total || 0 };
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
      const res: any = await httpClient.get<{ items: any[]; total: number; limit: number }>(`/reviews/cake/${cakeId}`, {
        params: { page }
      });
      return {
        items: (res.items || []).map(mapReviewToModel),
        total: res.total || 0,
        limit: res.limit || 10
      };
    },
    enabled: !!cakeId,
  });
};

export const useCategoriesQuery = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const items: any = await httpClient.get<any[]>("/categories");
      return (items || []).map(mapCategoryToModel);
    },
  });
};

export const useUploadImageMutation = () => {
  return useMutation({
    mutationFn: cakeApi.uploadImage,
  });
};
