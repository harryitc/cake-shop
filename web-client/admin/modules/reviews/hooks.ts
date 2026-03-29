import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewApi } from "./api";
import { mapReviewToModel } from "./mapper";

export const useReviewsQuery = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["reviews", page, limit],
    queryFn: async () => {
      const data = await reviewApi.getAll(page, limit);
      return {
        items: data.items.map(mapReviewToModel),
        total: data.total,
        page: data.page,
      };
    },
  });
};

export const useUpdateReviewStatusMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_approved }: { id: string; is_approved: boolean }) => 
      reviewApi.updateStatus(id, is_approved),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviews"] }),
  });
};

export const useReplyReviewMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reply }: { id: string; reply: string }) => 
      reviewApi.reply(id, reply),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviews"] }),
  });
};
