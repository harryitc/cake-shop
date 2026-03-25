import { ICake, ICakeDTO } from "./types";

export const mapCakeToModel = (dto: ICakeDTO): ICake => {
  return {
    id: dto._id,
    name: dto.name,
    description: dto.description,
    slug: dto.info?.slug,
    price: dto.price,
    formattedPrice: new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(dto.price),
    imageUrl: dto.image_url || "https://placehold.co/100x100?text=No+Image",
    createdAt: dto.createdAt,
    formattedDate: new Date(dto.createdAt).toLocaleDateString("vi-VN", {
      day: '2-digit', month: '2-digit', year: 'numeric'
    }),
  };
};
