import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "./api";

export const useAnalyticsQuery = () => {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: analyticsApi.getStats,
  });
};
