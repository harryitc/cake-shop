import { API_DOMAIN } from "@/lib/configs";

export const mapReviewToModel = (dto: any) => {
  const user = dto.user || {};
  const cake = dto.cake || {};

  return {
    id: dto._id || dto.id || "",
    user: {
      id: user._id || "",
      name: user.full_name || user.name || "Khách hàng ẩn danh",
      email: user.email || "N/A",
      avatar: user.avatar_url || user.avatar || "",
    },
    cake: {
      id: cake._id || "",
      name: cake.name || "Sản phẩm không tồn tại",
      image: cake.image_url ? (cake.image_url.startsWith('http') ? cake.image_url : `${API_DOMAIN}${cake.image_url}`) : "",
    },
    rating: dto.rating || 5,
    comment: dto.comment || "",
    reply: dto.reply || "",
    is_approved: dto.is_approved ?? true,
    createdAt: dto.createdAt || new Date().toISOString(),
  };
};

export type ReviewModel = ReturnType<typeof mapReviewToModel>;
