import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cakeApi } from "./api";
import { mapCakeToModel } from "./mapper";

export const useCakesQuery = (search?: string) => {
  return useQuery({
    queryKey: ["cakes", search],
    queryFn: async () => {
      const { items, total } = await cakeApi.getAll(search);
      return { 
        items: (items || []).map(mapCakeToModel), 
        total: total || 0 
      };
    },
  });
};

export const useCakeQuery = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ["cake", id],
    queryFn: async () => {
      const cake = await cakeApi.getById(id);
      return mapCakeToModel(cake);
    },
    enabled: !!id && enabled,
  });
};

export const useCreateCakeMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cakeApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cakes"] }),
  });
};

export const useUpdateCakeMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cakeApi.update,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cakes"] }),
  });
};

export const useDeleteCakeMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cakeApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cakes"] }),
  });
};

export const useImportCakesMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, mode }: { file: File; mode: string }) => cakeApi.import(file, mode),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cakes"] }),
  });
};

export const useUploadImageMutation = () => {
  return useMutation({
    mutationFn: cakeApi.uploadImage,
  });
};

export const useUploadModelMutation = () => {
  return useMutation({
    mutationFn: cakeApi.uploadModel,
  });
};
