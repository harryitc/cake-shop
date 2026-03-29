import { IUser } from "./types";

export const mapUserToModel = (dto: IUser) => {
  return {
    ...dto,
    id: dto._id,
    name: dto.full_name || "N/A",
    avatar: dto.avatar_url,
  };
};

export type UserModel = ReturnType<typeof mapUserToModel>;
