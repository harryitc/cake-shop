"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, Input, App, Button, Tag, Divider, Switch, InputNumber } from "antd";
import { useCreateOrderMutation } from "../hooks";
import { useMeQuery } from "../../auth/hooks";
import { useLoyaltyQuery } from "../../loyalty/hooks";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { orderApi } from "../api";
import {
  EnvironmentOutlined,
  ShoppingOutlined,
  ArrowLeftOutlined,
  TagOutlined,
  CreditCardOutlined
} from "@ant-design/icons";
import _ from "lodash";

const checkoutSchema = z.object({
  address: z.string().min(5, "Vui lòng nhập địa chỉ giao hàng cụ thể"),
  coupon_code: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

interface CheckoutPageContentProps {
  totalPrice: number;
  items: any[];
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

export const CheckoutPageContent = ({ totalPrice, items }: CheckoutPageContentProps) => {
  const { message } = App.useApp();
  const router = useRouter();
  const { mutate, isPending } = useCreateOrderMutation();
  const { data: me } = useMeQuery();
  const { data: loyaltyData } = useLoyaltyQuery();

  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    finalPrice: number;
  } | null>(null);

  const [usePoints, setUsePoints] = useState(false);
  const [isCustomizingPoints, setIsCustomizingPoints] = useState(false);
  const [customPoints, setCustomPoints] = useState(0);

  const { control, handleSubmit, formState: { errors }, setValue, getValues } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { address: "", coupon_code: "" },
  });

  const currentPoints = loyaltyData?.points ?? me?.loyalty_points ?? 0;

  const pointToVndRatio = 1;
  const maxDiscountPercentage = 20;

  const currentTotal = appliedCoupon ? appliedCoupon.finalPrice : totalPrice;
  const maxDiscountFromPoints = Math.floor(currentTotal * (maxDiscountPercentage / 100));
  const maxPointsAvailable = Math.min(currentPoints, Math.floor(maxDiscountFromPoints / pointToVndRatio));

  // Logic tính điểm mới
  let pointsToUse = 0;
  if (usePoints) {
    pointsToUse = isCustomizingPoints ? Math.min(customPoints, maxPointsAvailable) : maxPointsAvailable;
  }
  const pointsDiscountAmount = pointsToUse * pointToVndRatio;
  const finalOrderPrice = currentTotal - pointsDiscountAmount;

  useEffect(() => {
    if (me?.address) {
      setValue("address", me.address);
    }
  }, [me, setValue]);

  // Tự động tắt tùy chỉnh nếu người dùng tắt switch
  useEffect(() => {
    if (!usePoints) {
      setIsCustomizingPoints(false);
      setCustomPoints(0);
    }
  }, [usePoints]);

  const handleApplyCoupon = async () => {
    const code = getValues("coupon_code");
    if (!code) return;

    setCouponLoading(true);
    try {
      const result = await orderApi.validateCoupon(code);
      setAppliedCoupon({
        code: result.coupon.code,
        discountAmount: result.discountAmount,
        finalPrice: result.finalPrice
      });
      message.success("Đã áp dụng mã giảm giá");
    } catch (error: any) {
      message.error(error.message);
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const onSubmit = (values: CheckoutFormValues) => {
    mutate({
      address: values.address,
      coupon_code: appliedCoupon ? appliedCoupon.code : undefined,
      points_to_use: pointsToUse,
    }, {
      onSuccess: () => {
        message.success("Đặt hàng thành công");
        router.push("/orders");
      },
      onError: (err) => message.error(err.message || "Lỗi đặt hàng"),
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Cột trái: Form nhập liệu */}
      <div className="lg:col-span-8 space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <EnvironmentOutlined className="text-gray-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider m-0">Địa chỉ giao hàng</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-gray-50 rounded border border-gray-100">
              <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">Người nhận</div>
              <div className="text-sm font-semibold">{me?.name}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded border border-gray-100">
              <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">Số điện thoại</div>
              <div className="text-sm font-semibold">{me?.phone || "Chưa cập nhật"}</div>
            </div>
          </div>

          <Form layout="vertical">
            <Form.Item
              validateStatus={errors.address ? "error" : ""}
              help={errors.address?.message}
              className="mb-0"
            >
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <Input.TextArea
                    {...field}
                    rows={3}
                    placeholder="Nhập địa chỉ nhận bánh chi tiết..."
                    className="rounded border-gray-200 focus:border-indigo-500"
                  />
                )}
              />
            </Form.Item>
          </Form>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TagOutlined className="text-gray-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider m-0">Ưu đãi & Điểm thưởng</h2>
            </div>
          </div>

          <div className="space-y-4">
            {/* Điểm thưởng */}
            <div className="p-3 border border-indigo-50 rounded bg-indigo-50/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-indigo-900">Sử dụng Cake Points</div>
                  <div className="text-xs text-indigo-500">Bạn đang có {currentPoints.toLocaleString()} điểm</div>
                </div>
                <div className="flex items-center gap-3">
                  {usePoints && !isCustomizingPoints && <span className="text-sm font-bold text-indigo-600">-{maxPointsAvailable.toLocaleString()} pts</span>}
                  <Switch size="small" checked={usePoints} onChange={setUsePoints} disabled={!currentPoints} />
                </div>
              </div>

              {usePoints && (
                <div className="mt-3">
                  <Divider className="my-2" />
                  <div className="flex items-center justify-between">
                    <Button type="link" size="small" className="p-0 text-xs" onClick={() => setIsCustomizingPoints(!isCustomizingPoints)}>
                      {isCustomizingPoints ? 'Hủy tùy chỉnh' : 'Tùy chỉnh số điểm'}
                    </Button>
                    {isCustomizingPoints && (
                      <Button size="small" type="primary" ghost onClick={() => setCustomPoints(maxPointsAvailable)}>Dùng tối đa</Button>
                    )}
                  </div>

                  {isCustomizingPoints && (
                    <div className="mt-2">
                      <InputNumber
                        min={0}
                        max={maxPointsAvailable}
                        value={customPoints}
                        onChange={(value) => setCustomPoints(value || 0)}
                        placeholder="Nhập số điểm muốn dùng"
                        className="w-full"
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => _.parseInt(value!.replace(/\$\s?|(,*)/g, ''))}
                      />
                      <div className="text-[11px] text-indigo-400 mt-1">
                        * Tối đa {maxPointsAvailable.toLocaleString()} điểm cho đơn hàng này.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mã giảm giá */}
            <div className="flex gap-2">
              <Controller
                name="coupon_code"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Mã giảm giá (nếu có)"
                    className="rounded uppercase h-10"
                    disabled={!!appliedCoupon}
                  />
                )}
              />
              {appliedCoupon ? (
                <Button className="h-10 rounded border-red-200 text-red-500" onClick={() => { setAppliedCoupon(null); setValue("coupon_code", ""); }}>Gỡ bỏ</Button>
              ) : (
                <Button className="h-10 rounded bg-gray-800 text-white font-bold px-6" onClick={handleApplyCoupon} loading={couponLoading}>Áp dụng</Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cột phải: Tóm tắt & Thanh toán */}
      <div className="lg:col-span-4 sticky top-24">
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase m-0 flex items-center gap-2">
              <ShoppingOutlined /> Giỏ hàng ({items.length})
            </h3>
            <Button type="link" size="small" onClick={() => router.push("/cart")} className="p-0 text-xs">Sửa</Button>
          </div>

          <div className="p-4 max-h-[250px] overflow-y-auto space-y-3 border-b border-gray-100">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between gap-3">
                <div className="flex gap-3">
                  <img src={item.cake.imageUrl} className="w-10 h-10 rounded object-cover border border-gray-100" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold line-clamp-1">{item.cake.name}</span>
                    <span className="text-[10px] text-gray-400">x{item.quantity} {item.variant ? `(Size: ${item.variant.size})` : ""}</span>
                  </div>
                </div>
                <span className="text-xs font-bold">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="p-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Tạm tính</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Giảm giá (Coupon)</span>
                <span>-{formatPrice(appliedCoupon.discountAmount)}</span>
              </div>
            )}
            {pointsDiscountAmount > 0 && (
              <div className="flex justify-between text-indigo-600 font-medium">
                <span>Dùng điểm (Points)</span>
                <span>-{formatPrice(pointsDiscountAmount)}</span>
              </div>
            )}
            <Divider className="my-2" />
            <div className="flex justify-between items-center pt-1">
              <span className="font-bold">Tổng thanh toán</span>
              <span className="text-xl font-black text-indigo-600">{formatPrice(finalOrderPrice)}</span>
            </div>
          </div>

          <div className="p-4 pt-0">
            <Button
              type="primary"
              block
              size="large"
              icon={<CreditCardOutlined />}
              onClick={() => handleSubmit(onSubmit)()}
              loading={isPending}
              className="h-12 bg-indigo-600 font-bold uppercase tracking-wider rounded"
            >
              Đặt hàng ngay
            </Button>
            <Button
              type="text"
              block
              className="mt-2 text-gray-400 text-xs"
              onClick={() => router.push("/cart")}
              icon={<ArrowLeftOutlined />}
            >
              Quay lại giỏ hàng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
