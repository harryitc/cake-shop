import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "./api";
import { mapAnalyticsToModel } from "./mapper";

export const useAnalyticsQuery = () => {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const data = await analyticsApi.getStats();
      return mapAnalyticsToModel(data);
    },
  });
};
