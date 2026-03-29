import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customersService } from "./api"; // Vẫn giữ tên biến cũ trong api.ts để tránh sửa nhiều
import { mapCustomerToModel, mapPointHistoryToModel } from "./mapper";

export const useCustomersQuery = (page: number = 1, limit: number = 10, search?: string) => {
  return useQuery({
    queryKey: ["customers", page, limit, search],
    queryFn: async () => {
      const data = await customersService.getAll(page, limit, search);
      return {
        items: (data.items || []).map(mapCustomerToModel),
        total: data.total || 0
      };
    },
  });
};

export const useCustomerPointHistoryQuery = (userId: string, page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["customer-points", userId, page, limit],
    queryFn: async () => {
      const data = await customersService.getPointHistory(userId, { page, limit });
      return {
        items: (data.items || []).map(mapPointHistoryToModel),
        total: data.total || 0
      };
    },
    enabled: !!userId,
  });
};

export const useAdjustPointsMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, points, reason }: { userId: string; points: number; reason: string }) =>
      customersService.adjustPoints(userId, points, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      qc.invalidateQueries({ queryKey: ["customer-points"] });
    },
  });
};

export const useLoyaltyStatsQuery = () => {
  return useQuery({
    queryKey: ["loyalty-stats"],
    queryFn: customersService.getLoyaltyStats,
  });
};

export const useToggleRankLockMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, rank_lock }: { userId: string; rank_lock: boolean }) =>
      customersService.toggleRankLock(userId, rank_lock),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
};

export const useOverrideRankMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) =>
      customersService.overrideRank(userId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      qc.invalidateQueries({ queryKey: ["loyalty-stats"] });
    },
  });
};

export const useLoyaltyConfigQuery = () => {
  return useQuery({
    queryKey: ["loyalty-config"],
    queryFn: customersService.getLoyaltyConfig,
  });
};

export const useUpdateLoyaltyConfigMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (config: any) => customersService.updateLoyaltyConfig(config),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["loyalty-config"] }),
  });
};
