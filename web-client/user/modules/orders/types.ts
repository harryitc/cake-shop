export interface IOrderDTO {
  _id: string;
  user_id: {
    _id: string;
    email: string;
    full_name?: string;
    phone?: string;
    avatar_url?: string;
  };
  total_price: number;
  order_number?: string;
  coupon_code?: string;
  discount_amount?: number;
  final_price: number;
  points_used?: number;
  points_discount_amount?: number;
  points_earned?: number;
  status: 'PENDING' | 'CONFIRMED' | 'DONE' | 'REJECTED';
  address: string;
  items: Array<{
    cake_id: {
      _id: string;
      name: string;
      price: number;
      image_url?: string;
      slug?: string;
    };
    variant_id?: string;
    variant_size?: string;
    quantity: number;
    price_at_buy: number;
  }>;
  items_count?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IOrderItem {
  cake: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    slug: string;
  };
  variant_id?: string | null;
  variant_size?: string;
  quantity: number;
  price_at_buy: number;
  formattedPrice: string;
  totalPrice: number;
  formattedTotalPrice: string;
}

export interface IOrder {
  id: string;
  status: string;
  totalPrice: number;
  final_price: number;
  formattedTotal: string;
  address: string;
  itemsCount: number;
  items: IOrderItem[];
  user: {
    name: string;
    email: string;
    phone: string;
  };
  createdAt: string;
  formattedDate: string;
  coupon_code: string;
  discount_amount: number;
  points_used: number;
  points_discount_amount: number;
  points_earned: number;
}

export interface ICreateOrderPayload {
  address: string;
  coupon_code?: string;
  points_to_use?: number;
}
