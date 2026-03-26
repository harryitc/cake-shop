import { useQuery, useMutation } from "@tanstack/react-query";
import { cakeApi } from "./api";
import { mapCakeToModel } from "./mapper";

export const useCakesQuery = (search?: string, category?: string) => {
  return useQuery({
    queryKey: ["cakes", search, category],
    queryFn: async () => {
      const { items, total } = await cakeApi.getAll(search, category);
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

export const useUploadImageMutation = () => {
  return useMutation({
    mutationFn: cakeApi.uploadImage,
  });
};
