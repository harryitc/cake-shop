import { ICartResponse, ICartItemDTO } from "./types";
import { API_DOMAIN } from "@/lib/configs";

const formatVND = (price?: number) => {
  if (typeof price !== 'number' || isNaN(price)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
};

export const mapCartToModel = (dto: ICartResponse) => {
  return {
    items: (dto.items || []).map((item: ICartItemDTO) => {
      // Trường hợp cake bị null (sản phẩm đã bị xóa)
      const rawCake = item.cake || {};
      const imageUrl = rawCake.image_url 
        ? (rawCake.image_url.startsWith('http') ? rawCake.image_url : `${API_DOMAIN}${rawCake.image_url}`)
        : "https://placehold.co/100x100?text=No+Img";

      // Trường hợp variant (nếu có chọn size)
      const variant = item.variant || null;

      return {
        id: item.id || (item as any)._id || Math.random().toString(36).substr(2, 9),
        quantity: item.quantity || 0,
        price: item.price || 0,
        formattedPrice: formatVND(item.price || 0),
        subtotal: item.subtotal || 0,
        formattedSubtotal: formatVND(item.subtotal || 0),
        variant: variant ? {
          id: variant._id,
          size: variant.size,
          price: variant.price,
        } : null,
        cake: {
          id: rawCake._id || "deleted",
          name: rawCake.name || "Sản phẩm không còn tồn tại",
          price: rawCake.price || 0,
          imageUrl,
          slug: rawCake.slug || "",
        }
      };
    }),
    total: dto.total || 0,
    formattedTotal: formatVND(dto.total || 0),
  };
};

export type CartModel = ReturnType<typeof mapCartToModel>;
