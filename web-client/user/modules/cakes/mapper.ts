import { ICake, ICakeDTO } from "./types";

export const mapCakeToModel = (dto: ICakeDTO): ICake => {
  return {
    id: dto._id,
    name: dto.name,
    description: dto.description,
    slug: dto.info?.slug,
    price: dto.price,
    stock: dto.stock || 0,
    formattedPrice: new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(dto.price),
    imageUrl: dto.image_url || "https://placehold.co/400x300?text=No+Image",
    createdAt: dto.createdAt,
  };
};
