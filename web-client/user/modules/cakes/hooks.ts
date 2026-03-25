import { useQuery } from "@tanstack/react-query";
import { cakeApi } from "./api";
import { mapCakeToModel } from "./mapper";

export const useCakesQuery = (search?: string) => {
  return useQuery({
    queryKey: ["cakes", search],
    queryFn: async () => {
      const { items, total } = await cakeApi.getAll(search);
      return { items: items.map(mapCakeToModel), total };
    },
  });
};

export const useCakeQuery = (id: string) => {
  return useQuery({
    queryKey: ["cakes", id],
    queryFn: async () => {
      const { cake } = await cakeApi.getById(id);
      return mapCakeToModel(cake);
    },
    enabled: !!id,
  });
};
