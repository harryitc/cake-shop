export interface IOrderDTO {
  _id: string;
  status: string;
  total_price: number;
  coupon_code?: string;
  discount_amount?: number;
  final_price?: number;
  address: string;
  createdAt: string;
  user_id?: { email: string };
  items?: any[];
  items_count?: number;
}

export interface IOrder {
  id: string;
  status: string;
  totalPrice: number;
  formattedTotal: string;
  address: string;
  createdAt: string;
  formattedDate: string;
  userEmail: string;
  itemsCount: number;
  couponCode?: string;
  discountAmount?: number;
  finalPrice?: number;
}

export interface IUpdateStatusPayload {
  status: string;
}
