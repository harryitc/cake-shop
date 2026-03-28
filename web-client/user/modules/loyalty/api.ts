import { httpClient } from "@/lib/http";
import { ILoyaltyInfo } from "./types";

export const loyaltyApi = {
  getMyLoyalty: () => 
    httpClient<ILoyaltyInfo>("/loyalty/me", { method: "GET" }),
};
