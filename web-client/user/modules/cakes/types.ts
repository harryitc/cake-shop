export interface ICategoryDTO {
  _id: string;
  name: string;
  slug: string;
}

export interface ICakeDTO {
  _id: string;
  name: string;
  category?: ICategoryDTO;
  description?: string;
  slug?: string;
  price: number;
  stock?: number;
  image_url?: string;
  average_rating?: number;
  review_count?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ICake {
  id: string;
  name: string;
  category?: ICategoryDTO;
  description?: string;
  slug?: string;
  price: number;
  stock: number;
  formattedPrice: string;
  imageUrl: string;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
}
