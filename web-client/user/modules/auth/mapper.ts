import { IUser } from "./types";

export const mapUserToModel = (dto: IUser) => {
  return {
    id: dto._id,
    email: dto.email,
    name: dto.name,
    role: dto.role,
    phone: dto.phone,
    address: dto.address,
    avatar: dto.avatar,
    loyalty_points: dto.loyalty_points,
    rank: dto.rank,
    createdAt: dto.createdAt,
  };
};

export type UserModel = ReturnType<typeof mapUserToModel>;
