import { IOrderDTO, IOrder } from "./types";

const formatPrice = (price: number) => 
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const formatDate = (date: string) => {
  return new Date(date).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const mapOrderToModel = (dto: IOrderDTO): IOrder => {
  return {
    id: dto._id,
    status: dto.status,
    totalPrice: dto.total_price,
    formattedTotal: formatPrice(dto.final_price || dto.total_price),
    address: dto.address,
    createdAt: dto.createdAt,
    formattedDate: formatDate(dto.createdAt),
    userEmail: dto.user_id?.email || "N/A",
    itemsCount: dto.items_count || dto.items?.length || 0,
    couponCode: dto.coupon_code,
    discountAmount: dto.discount_amount,
    finalPrice: dto.final_price,
  };
};
