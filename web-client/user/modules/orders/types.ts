export interface IOrderDTO {
  _id: string;
  user_id: string | { email: string };
  total_price: number;
  coupon_code?: string;
  discount_amount?: number;
  final_price?: number;
  points_used?: number;
  points_discount_amount?: number;
  points_earned?: number;
  status: 'PENDING' | 'CONFIRMED' | 'DONE' | 'REJECTED';
  address: string;
  items: Array<{
    cake_id: any;
    quantity: number;
    price_at_buy: number;
  }>;
  items_count?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IOrderItem {
  cake_id: string | any;
  variant_id?: string | null;
  variant_size?: string;
  quantity: number;
  price_at_buy: number;
}

export interface IOrder {
  id: string;
  status: string;
  totalPrice: number;
  formattedTotal: string;
  address: string;
  itemsCount: number;
  items: IOrderItem[];
  createdAt: string;
  formattedDate: string;
  coupon_code?: string;
  discount_amount?: number;
  final_price?: number;
  points_used?: number;
  points_discount_amount?: number;
  points_earned?: number;
}

export interface ICreateOrderPayload {
  address: string;
  coupon_code?: string;
  points_to_use?: number;
}
