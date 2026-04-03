import { Coupon } from "./types";

export const mapCouponToModel = (dto: any) => {
  // Chuẩn hóa Enum từ Backend sang Frontend
  const discount_type = dto.type === 'PERCENT' ? 'PERCENTAGE' : 'FIXED_AMOUNT';

  return {
    id: dto._id || dto.id || "",
    code: dto.code || "",
    description: dto.description || "",
    discount_type: discount_type,
    discount_value: dto.value || 0, // Backend dùng 'value'
    min_order_value: dto.min_order_value || 0,
    max_discount_value: dto.max_discount_value || 0,
    start_date: dto.start_date || new Date().toISOString(),
    end_date: dto.end_date || new Date().toISOString(),
    usage_limit: dto.usage_limit || 0,
    usage_limit_per_user: dto.usage_limit_per_user || 1, // Mặc định là 1 nếu từ server trả về bị thiếu
    used_count: dto.used_count || 0,
    is_active: dto.is_active ?? true,
    applicable_categories: (dto.applicable_categories || []).map((cat: any) => 
      typeof cat === 'object' ? (cat._id || cat.id) : cat
    ),
    createdAt: dto.createdAt || new Date().toISOString(),
  };
};

export type CouponModel = ReturnType<typeof mapCouponToModel>;
