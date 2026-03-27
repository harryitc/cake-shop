export interface IOrderItem {
  cake_id: {
    _id: string;
    name: string;
    price: number;
    image_url: string;
    slug: string;
  } | string | any;
  variant_id?: string | null;
  variant_size?: string;
  quantity: number;
  price_at_buy: number;
}

export interface IOrderDTO {
  _id: string;
  status: string;
  total_price: number;
  coupon_code?: string;
  discount_amount?: number;
  final_price?: number;
  address: string;
  createdAt: string;
  user_id?: { 
    _id: string;
    email: string;
    full_name?: string;
    phone?: string;
    avatar_url?: string;
  };
  items?: IOrderItem[];
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
  userName: string;
  userEmail: string;
  userPhone: string;
  userAvatar?: string;
  itemsCount: number;
  items: IOrderItem[];
  couponCode?: string;
  discountAmount?: number;
  finalPrice?: number;
}

export interface IUpdateStatusPayload {
  status: string;
}
