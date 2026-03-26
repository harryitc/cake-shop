export interface ICakeDTO {
  _id: string;
  name: string;
  description?: string;
  info?: { slug: string };
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
  slug?: string;
  price: number;
  stock: number;
  formattedPrice: string;
  imageUrl: string;
  createdAt: string;
}
