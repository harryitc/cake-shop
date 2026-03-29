import { IOrder, IOrderDTO, IOrderItem } from "./types";
import { API_DOMAIN } from "@/lib/configs";

const formatVND = (price?: number) => {
  if (typeof price !== 'number' || isNaN(price)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
};

export const mapOrderToModel = (dto: IOrderDTO): IOrder => {
  const safeDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleString("vi-VN");
  };

  const finalPrice = dto.final_price ?? dto.total_price ?? 0;

  // Xử lý items một cách an toàn (Hỗ trợ cả trường hợp cake_id chưa được populate)
  const items: IOrderItem[] = (dto.items || []).map(item => {
    const isPopulated = item.cake_id && typeof item.cake_id === 'object';
    const rawCake = isPopulated ? item.cake_id : {};
    
    const imageUrl = rawCake.image_url 
      ? (rawCake.image_url.startsWith('http') ? rawCake.image_url : `${API_DOMAIN}${rawCake.image_url}`)
      : "https://placehold.co/100x100?text=No+Img";
    
    const totalPrice = (item.price_at_buy || 0) * (item.quantity || 0);

    return {
      cake: {
        id: rawCake._id || (typeof item.cake_id === 'string' ? item.cake_id : "deleted"),
        name: rawCake.name || "Sản phẩm không còn tồn tại",
        price: rawCake.price || item.price_at_buy || 0,
        imageUrl,
        slug: rawCake.slug || "",
      },
      variant_id: item.variant_id || null,
      variant_size: item.variant_size || "",
      quantity: item.quantity || 0,
      price_at_buy: item.price_at_buy || 0,
      formattedPrice: formatVND(item.price_at_buy),
      totalPrice,
      formattedTotalPrice: formatVND(totalPrice),
    };
  });

  // Kiểm tra user_id đã populate chưa
  const isUserPopulated = dto.user_id && typeof dto.user_id === 'object';

  return {
    id: dto._id || "",
    status: dto.status || "PENDING",
    totalPrice: dto.total_price || 0,
    final_price: finalPrice,
    formattedTotal: formatVND(finalPrice),
    address: dto.address || "Chưa cung cấp địa chỉ",
    itemsCount: dto.items_count ?? items.length,
    items,
    user: {
      name: isUserPopulated ? (dto.user_id.full_name || "Khách hàng") : "Khách hàng",
      email: isUserPopulated ? (dto.user_id.email || "N/A") : "N/A",
      phone: isUserPopulated ? (dto.user_id.phone || "N/A") : "N/A",
    },
    createdAt: dto.createdAt || "",
    formattedDate: safeDate(dto.createdAt),
    coupon_code: dto.coupon_code || "",
    discount_amount: dto.discount_amount || 0,
    points_used: dto.points_used || 0,
    points_discount_amount: dto.points_discount_amount || 0,
    points_earned: dto.points_earned || 0,
  };
};

export type OrderModel = ReturnType<typeof mapOrderToModel>;
