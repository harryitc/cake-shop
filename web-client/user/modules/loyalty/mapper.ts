import { ILoyaltyInfo } from "./types";

export const mapLoyaltyToModel = (dto: any) => {
  return {
    points: dto.loyalty_points || 0,
    rank: dto.rank || "BRONZE",
    nextRankPoints: dto.nextRankPoints || 0,
    totalSpent: dto.total_spent || 0,
    history: (dto.history || []).map((h: any) => ({
      id: h._id || "",
      points: h.points_change || 0,
      type: h.type || "EARN",
      reason: h.reason || "Không xác định",
      createdAt: h.createdAt || new Date().toISOString(),
    })),
  };
};

export type LoyaltyModel = ReturnType<typeof mapLoyaltyToModel>;
