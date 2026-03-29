import { Coupon } from "./types";

export const mapCouponToModel = (dto: Coupon) => {
  return {
    id: dto._id,
    code: dto.code,
    description: dto.description,
    discount_type: dto.discount_type,
    discount_value: dto.discount_value,
    min_order_value: dto.min_order_value,
    max_discount_value: dto.max_discount_value,
    start_date: dto.start_date,
    end_date: dto.end_date,
    usage_limit: dto.usage_limit,
    used_count: dto.used_count,
    is_active: dto.is_active,
    applicable_categories: dto.applicable_categories,
    createdAt: dto.createdAt,
  };
};

export type CouponModel = ReturnType<typeof mapCouponToModel>;
