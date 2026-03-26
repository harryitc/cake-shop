export interface ICategoryDTO {
  _id: string;
  name: string;
  slug: string;
}

export interface ICakeDTO {
  _id: string;
  name: string;
  description?: string;
  category?: ICategoryDTO | string;
  slug?: string;
  price: number;
  stock?: number;
  image_url?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICake {
  id: string;
  name: string;
  description?: string;
  category?: ICategoryDTO;
  slug?: string;
  price: number;
  stock: number;
  formattedPrice: string;
  imageUrl: string;
  createdAt: string;
  formattedDate: string;
}

export interface ICreateCakePayload {
  name: string;
  category: string;
  description?: string;
  price: number;
  stock?: number;
  image_url?: string;
}

export interface IUpdateCakePayload extends Partial<ICreateCakePayload> {}
