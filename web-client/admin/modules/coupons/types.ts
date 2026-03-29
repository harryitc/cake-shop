export interface Coupon {
  _id: string;
  code: string;
  description?: string;
  discount_type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discount_value: number;
  min_order_value: number;
  max_discount_value?: number;
  start_date: string;
  end_date: string;
  usage_limit: number;
  usage_count: number;
  is_active: boolean;
  applicable_categories?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ICouponPayload {
  code: string;
  description?: string;
  discount_type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discount_value: number;
  min_order_value: number;
  max_discount_value?: number;
  start_date: string;
  end_date: string;
  usage_limit: number;
  is_active: boolean;
  applicable_categories?: string[];
}
