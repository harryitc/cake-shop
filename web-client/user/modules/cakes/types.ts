export interface ICategoryDTO {
  _id: string;
  name: string;
  slug: string;
  type?: string;
  is_featured?: boolean;
}

export interface IVariant {
  _id: string;
  size: string;
  price: number;
  stock: number;
}

export interface ICakeDTO {
  _id: string;
  name: string;
  category?: ICategoryDTO;
  categories?: ICategoryDTO[];
  description?: string;
  slug?: string;
  price: number;
  stock?: number;
  image_url?: string;
  variants?: IVariant[];
  tags?: string[];
  ingredients?: string[];
  specifications?: {
    weight?: string;
    servings?: string;
  };
  average_rating?: number;
  review_count?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ICake {
  id: string;
  name: string;
  category?: ICategoryDTO;
  categories?: ICategoryDTO[];
  description?: string;
  slug?: string;
  price: number;
  stock: number;
  formattedPrice: string;
  imageUrl: string;
  variants: IVariant[];
  tags: string[];
  ingredients: string[];
  specifications: {
    weight: string;
    servings: string;
  };
  averageRating: number;
  reviewCount: number;
  createdAt: string;
}
