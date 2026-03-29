import { ICake, ICakeDTO } from "./types";

import { API_DOMAIN } from "@/lib/configs";


export const mapCakeToModel = (dto: any): ICake => {
  const imageUrl = dto.image_url 
    ? (dto.image_url.startsWith('http') ? dto.image_url : `${API_DOMAIN}${dto.image_url}`)
    : "https://placehold.co/100x100?text=No+Image";

  const price = dto.price || 0;

  return {
    id: dto._id || dto.id || "",
    name: dto.name || "Không tên",
    description: dto.description || "",
    category: dto.category || null,
    categories: dto.categories || [],
    slug: dto.slug || "",
    price: price,
    stock: dto.stock || 0,
    formattedPrice: new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price),
    imageUrl,
    variants: (dto.variants || []).map((v: any) => ({
      _id: v._id || "",
      size: v.size || "Standard",
      price: v.price || 0,
      stock: v.stock || 0
    })),
    tags: dto.tags || [],
    ingredients: dto.ingredients || [],
    specifications: {
      weight: dto.specifications?.weight || "Chưa rõ",
      servings: dto.specifications?.servings || "Chưa rõ",
    },
    createdAt: dto.createdAt || new Date().toISOString(),
    formattedDate: dto.createdAt ? new Date(dto.createdAt).toLocaleDateString("vi-VN", {
      day: '2-digit', month: '2-digit', year: 'numeric'
    }) : "N/A",
  };
};
