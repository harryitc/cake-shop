import { ICake, ICakeDTO } from "./types";

const API_DOMAIN = process.env.NEXT_PUBLIC_API_DOMAIN || "http://localhost:5000";

export const mapCakeToModel = (dto: ICakeDTO): ICake => {
  const imageUrl = dto.image_url 
    ? (dto.image_url.startsWith('http') ? dto.image_url : `${API_DOMAIN}${dto.image_url}`)
    : "https://placehold.co/400x300?text=No+Image";

  return {
    id: dto._id,
    name: dto.name,
    category: dto.category,
    description: dto.description,
    slug: dto.slug,
    price: dto.price,
    stock: dto.stock || 0,
    formattedPrice: new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(dto.price),
    imageUrl,
    averageRating: dto.average_rating || 0,
    reviewCount: dto.review_count || 0,
    createdAt: dto.createdAt,
  };
};
