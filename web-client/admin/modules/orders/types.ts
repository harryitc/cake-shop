export interface IOrderDTO {
  _id: string;
  user_id: {
    _id: string;
    full_name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
  };
  items: Array<{
    cake_id: string;
    name: string;
    quantity: number;
    price_at_buy: number;
    image_url: string;
  }>;
  total_price: number;
  final_price: number;
  status: 'PENDING' | 'CONFIRMED' | 'DONE' | 'REJECTED';
  address: string;
  phone: string;
  notes?: string;
  coupon_code?: string;
  discount_amount?: number;
  points_used?: number;
  points_discount_amount?: number;
  points_earned?: number;
  items_count?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IOrder {
  id: string;
  status: string;
  totalPrice: number;
  formattedTotal: string;
  address: string;
  createdAt: string;
  formattedDate: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userAvatar?: string;
  itemsCount: number;
  items: any[];
  couponCode?: string;
  discountAmount?: number;
  finalPrice?: number;
  pointsUsed?: number;
  pointsDiscountAmount?: number;
  pointsEarned?: number;
}

export interface IUpdateOrderPayload {
  status: 'PENDING' | 'CONFIRMED' | 'DONE' | 'REJECTED';
}
