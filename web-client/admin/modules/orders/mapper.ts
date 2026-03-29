import { IOrderDTO, IOrder } from "./types";
import { API_DOMAIN } from "@/lib/configs";

const formatPrice = (price?: number) => 
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price || 0);

const formatDate = (date?: string) => {
  if (!date) return "N/A";
  const d = new Date(date);
  return isNaN(d.getTime()) ? "N/A" : d.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const mapOrderToModel = (dto: any): IOrder => {
  const isUserPopulated = dto.user_id && typeof dto.user_id === 'object';
  const items = dto.items || [];

  return {
    id: dto._id || dto.id || "",
    status: dto.status || "PENDING",
    totalPrice: dto.total_price || 0,
    formattedTotal: formatPrice(dto.final_price ?? dto.total_price),
    address: dto.address || "Chưa có địa chỉ",
    createdAt: dto.createdAt || "",
    formattedDate: formatDate(dto.createdAt),
    userName: isUserPopulated ? (dto.user_id.full_name || dto.user_id.name || "Khách hàng") : "Khách hàng",
    userEmail: isUserPopulated ? (dto.user_id.email || "N/A") : "N/A",
    userPhone: isUserPopulated ? (dto.user_id.phone || "N/A") : "N/A",
    userAvatar: isUserPopulated ? (dto.user_id.avatar_url || dto.user_id.avatar) : undefined,
    itemsCount: dto.items_count || items.length || 0,
    items: items.map((item: any) => ({
      ...item,
      cake: item.cake_id && typeof item.cake_id === 'object' ? {
        id: item.cake_id._id,
        name: item.cake_id.name,
        imageUrl: item.cake_id.image_url ? (item.cake_id.image_url.startsWith('http') ? item.cake_id.image_url : `${API_DOMAIN}${item.cake_id.image_url}`) : ""
      } : null
    })),
    couponCode: dto.coupon_code || "",
    discountAmount: dto.discount_amount || 0,
    finalPrice: dto.final_price || 0,
    pointsUsed: dto.points_used || 0,
    pointsDiscountAmount: dto.points_discount_amount || 0,
    pointsEarned: dto.points_earned || 0,
  };
};
