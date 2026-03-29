import { IUser } from "./types";

export const mapUserToModel = (dto: IUser) => {
  return {
    id: dto._id,
    email: dto.email,
    name: dto.name,
    role: dto.role,
    phone: dto.phone,
    avatar: dto.avatar,
    createdAt: dto.createdAt,
  };
};

export type UserModel = ReturnType<typeof mapUserToModel>;
