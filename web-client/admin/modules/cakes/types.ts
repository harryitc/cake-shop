export interface ICategoryDTO {
  _id: string;
  name: string;
  slug: string;
  type?: string;
}

export interface IVariant {
  _id?: string;
  size: string;
  price: number;
  stock: number;
}

export interface ICakeDTO {
  _id: string;
  name: string;
  description?: string;
  category: ICategoryDTO | string;
  categories?: (ICategoryDTO | string)[];
  slug?: string;
  price: number;
  stock: number;
  image_url?: string;
  variants?: IVariant[];
  tags?: string[];
  ingredients?: string[];
  specifications?: {
    weight?: string;
    servings?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ICake {
  id: string;
  name: string;
  description?: string;
  category?: ICategoryDTO;
  categories?: ICategoryDTO[];
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
  createdAt: string;
  formattedDate: string;
}

export interface ICreateCakePayload {
  name: string;
  category: string;
  categories?: string[];
  description?: string;
  price: number;
  stock: number;
  image_url?: string;
  variants?: IVariant[];
  tags?: string[];
  ingredients?: string[];
  specifications?: {
    weight?: string;
    servings?: string;
  };
}

export interface IUpdateCakePayload extends Partial<ICreateCakePayload> {}
