import { ICake, ICakeDTO } from "./types";

import { API_DOMAIN } from "@/lib/configs";


export const mapCakeToModel = (dto: ICakeDTO): ICake => {
  const imageUrl = dto.image_url 
    ? (dto.image_url.startsWith('http') ? dto.image_url : `${API_DOMAIN}${dto.image_url}`)
    : "https://placehold.co/400x300?text=No+Image";

  return {
    id: dto._id || "",
    name: dto.name || "Sản phẩm không tên",
    category: dto.category,
    categories: dto.categories || [],
    description: dto.description || "Chưa có mô tả cho sản phẩm này.",
    slug: dto.slug || "",
    price: dto.price || 0,
    stock: dto.stock || 0,
    formattedPrice: new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(dto.price || 0),
    imageUrl,
    modelUrl: dto.model_url 
      ? (dto.model_url.startsWith('http') ? dto.model_url : `${API_DOMAIN}${dto.model_url}`) 
      : undefined,
    variants: (dto.variants || []).map(v => ({
      _id: v._id || "",
      size: v.size || "N/A",
      price: v.price || 0,
      stock: v.stock || 0
    })),
    tags: dto.tags || [],
    ingredients: dto.ingredients || [],
    specifications: {
      weight: dto.specifications?.weight || "Chưa rõ",
      servings: dto.specifications?.servings || "Chưa rõ",
    },
    averageRating: dto.average_rating || 0,
    reviewCount: dto.review_count || 0,
    createdAt: dto.createdAt || new Date().toISOString(),
  };
};

export const mapCategoryToModel = (dto: any) => {
  return {
    id: dto._id || dto.id || "",
    name: dto.name || "Danh mục không tên",
    slug: dto.slug || "",
    description: dto.description || "",
    imageUrl: dto.image_url || "",
    type: dto.type || "OTHER",
    isFeatured: dto.is_featured || false,
  };
};

export const mapReviewToModel = (dto: any) => {
  return {
    id: dto._id || dto.id || "",
    userId: dto.user?._id || dto.user || "",
    userName: dto.user?.full_name || dto.user?.name || "Người dùng ẩn danh",
    userAvatar: dto.user?.avatar_url || dto.user?.avatar || "",
    rating: dto.rating || 5,
    comment: dto.comment || "Không có nhận xét.",
    reply: dto.reply || "",
    repliedAt: dto.repliedAt || null,
    createdAt: dto.createdAt || new Date().toISOString(),
  };
};
