import { IOrder, IOrderDTO } from "./types";

export const mapOrderToModel = (dto: IOrderDTO): IOrder => {
  return {
    id: dto._id,
    status: dto.status,
    totalPrice: dto.total_price,
    formattedTotal: new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(dto.total_price),
    address: dto.address,
    createdAt: dto.createdAt,
    formattedDate: new Date(dto.createdAt).toLocaleDateString("vi-VN", {
      hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric",
    }),
    userEmail: dto.user_id?.email || "Unknown User",
    itemsCount: dto.items_count || dto.items?.length || 0,
  };
};
