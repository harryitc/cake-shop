import { useQuery } from "@tanstack/react-query";
import { loyaltyApi } from "./api";
import { mapLoyaltyToModel } from "./mapper";

export const useLoyaltyQuery = () => {
  return useQuery({
    queryKey: ["loyalty"],
    queryFn: async () => {
      const data = await loyaltyApi.getLoyaltyMe();
      return mapLoyaltyToModel(data);
    },
  });
};
