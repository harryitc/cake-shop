import { useQuery } from "@tanstack/react-query";
import { loyaltyApi } from "./api";

export const useLoyaltyQuery = () => {
  return useQuery({
    queryKey: ["loyalty"],
    queryFn: loyaltyApi.getMyLoyalty,
  });
};
