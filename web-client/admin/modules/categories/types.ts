export interface Category {
  _id: string;
  name: string;
  description?: string;
  image_url?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICategoryPayload {
  name: string;
  description?: string;
  image_url?: string;
}
