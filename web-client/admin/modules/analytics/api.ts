import { httpClient } from "@/lib/http";
import { IAnalyticsResponse } from "./types";

export const analyticsApi = {
  getStats: () => httpClient.get<IAnalyticsResponse>("/analytics/stats"),
};
