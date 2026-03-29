import { ILoyaltyInfo } from "./types";

export const mapLoyaltyToModel = (dto: ILoyaltyInfo) => {
  return {
    points: dto.points,
    rank: dto.rank,
    nextRankPoints: dto.nextRankPoints,
    history: dto.history.map(h => ({
      id: h._id,
      points: h.points,
      type: h.type,
      reason: h.reason,
      createdAt: h.createdAt,
    })),
  };
};

export type LoyaltyModel = ReturnType<typeof mapLoyaltyToModel>;
