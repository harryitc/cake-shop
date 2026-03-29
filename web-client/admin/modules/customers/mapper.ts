import { ICustomerDTO, IPointHistoryDTO } from "./types";

export const mapCustomerToModel = (dto: any) => {
  return {
    id: dto._id || dto.id || "",
    name: dto.full_name || dto.name || "Khách hàng",
    email: dto.email || "N/A",
    phone: dto.phone || "",
    address: dto.address || "",
    avatar: dto.avatar_url || dto.avatar || "",
    loyalty_points: dto.loyalty_points || 0,
    total_spent: dto.total_spent || 0,
    total_orders: dto.total_orders || 0,
    rank: dto.rank || "BRONZE",
    rank_lock: dto.rank_lock ?? false,
    createdAt: dto.createdAt || new Date().toISOString()
  };
};

export const mapPointHistoryToModel = (dto: any) => {
  return {
    id: dto._id || dto.id || "",
    points: dto.points_change || 0,
    type: dto.type || "PLUS",
    reason: dto.reason || "Không xác định",
    createdAt: dto.createdAt || new Date().toISOString()
  };
};

export type CustomerModel = ReturnType<typeof mapCustomerToModel>;
export type PointHistoryModel = ReturnType<typeof mapPointHistoryToModel>;
