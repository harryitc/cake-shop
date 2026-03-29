import { ICustomerDTO, IPointHistoryDTO } from "./types";

export const mapCustomerToModel = (dto: ICustomerDTO) => {
  return {
    id: dto._id,
    name: dto.name,
    email: dto.email,
    avatar: dto.avatar,
    loyalty_points: dto.loyalty_points,
    rank: dto.rank,
    rank_lock: dto.rank_lock,
    createdAt: dto.createdAt
  };
};

export const mapPointHistoryToModel = (dto: IPointHistoryDTO) => {
  return {
    id: dto._id,
    points: dto.points,
    type: dto.type,
    reason: dto.reason,
    createdAt: dto.createdAt
  };
};

export type CustomerModel = ReturnType<typeof mapCustomerToModel>;
export type PointHistoryModel = ReturnType<typeof mapPointHistoryToModel>;
