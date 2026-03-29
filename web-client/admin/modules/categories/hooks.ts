import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryApi } from "./api";
import { mapCategoryToModel } from "./mapper";

export const useCategoriesQuery = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const data = await categoryApi.getAll();
      return data.map(mapCategoryToModel);
    },
  });
};

export const useCreateCategoryMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoryApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
};

export const useUpdateCategoryMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => categoryApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
};

export const useDeleteCategoryMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoryApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
};
