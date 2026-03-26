import { ICake, ICakeDTO } from "./types";

const API_DOMAIN = process.env.NEXT_PUBLIC_API_DOMAIN || "http://localhost:5000";

export const mapCakeToModel = (dto: ICakeDTO): ICake => {
  const imageUrl = dto.image_url 
    ? (dto.image_url.startsWith('http') ? dto.image_url : `${API_DOMAIN}${dto.image_url}`)
    : "https://placehold.co/100x100?text=No+Image";

  return {
    id: dto._id,
    name: dto.name,
    description: dto.description,
    category: typeof dto.category === 'object' ? dto.category : undefined,
    categories: Array.isArray(dto.categories) ? dto.categories.filter(c => typeof c === 'object') as any : [],
    slug: dto.slug,
    price: dto.price,
    stock: dto.stock || 0,
    formattedPrice: new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(dto.price),
    imageUrl,
    variants: dto.variants || [],
    tags: dto.tags || [],
    ingredients: dto.ingredients || [],
    specifications: {
      weight: dto.specifications?.weight || "Chưa rõ",
      servings: dto.specifications?.servings || "Chưa rõ",
    },
    createdAt: dto.createdAt,
    formattedDate: new Date(dto.createdAt).toLocaleDateString("vi-VN", {
      day: '2-digit', month: '2-digit', year: 'numeric'
    }),
  };
};
