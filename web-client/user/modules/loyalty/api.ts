import { httpClient } from "@/lib/http";
import { ILoyaltyInfo } from "./types";

export const loyaltyApi = {
  getLoyaltyMe: () => 
    httpClient.get<ILoyaltyInfo>("/loyalty/me"),
};
