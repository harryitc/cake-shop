import { useQuery } from "@tanstack/react-query";
import { loyaltyApi } from "./api";
import { mapLoyaltyToModel } from "./mapper";
import { authStorage } from "@/lib/http";

export const useLoyaltyQuery = () => {
  return useQuery({
    queryKey: ["loyalty"],
    queryFn: async () => {
      const data = await loyaltyApi.getLoyaltyMe();
      return mapLoyaltyToModel(data);
    },
    enabled: typeof window !== "undefined" ? !!authStorage.getToken() : false,
  });
};

export const useLoyaltyConfigQuery = () => {
  return useQuery({
    queryKey: ["loyalty-config"],
    queryFn: async () => {
      const data = await loyaltyApi.getConfig();
      return data;
    },
    enabled: typeof window !== "undefined" ? !!authStorage.getToken() : false,
  });
};
