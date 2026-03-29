import { IUser } from "./types";

export const mapUserToModel = (dto: any) => {
  return {
    id: dto.id || dto._id || "",
    email: dto.email || "",
    name: dto.full_name || "", // Đảm bảo lấy đúng full_name từ Backend
    role: dto.role || "USER",
    phone: dto.phone || "",
    address: dto.address || "",
    avatar: dto.avatar_url || "", // Trả về raw string để utils.ts xử lý hiển thị thống nhất
    loyalty_points: dto.loyalty_points || 0,
    rank: dto.rank || "BRONZE",
    createdAt: dto.createdAt || "",
  };
};

export type UserModel = ReturnType<typeof mapUserToModel>;
