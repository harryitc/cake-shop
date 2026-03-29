// Các Interface/Type đồng bộ chuẩn với Model backend trả ra.

export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

export interface Cake {
  id: string;
  name: string;
  description: string;
  slug: string;
  price: number;
  image_url?: string;
}

export interface ApiResponse<T> {
  message?: string;
  data: T;
}

export interface Wishlist {
}

