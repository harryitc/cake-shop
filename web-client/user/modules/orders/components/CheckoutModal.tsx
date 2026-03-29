"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal, Form, Input, App, Button, Tag, Divider, Avatar, Switch } from "antd";
import { useCreateOrderMutation } from "../hooks";
import { useMeQuery } from "../../auth/hooks";
import { useLoyaltyQuery } from "../../loyalty/hooks";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { orderApi } from "../api";
import { GiftOutlined, CheckCircleOutlined, UserOutlined, PhoneOutlined, EnvironmentOutlined, StarOutlined, MailOutlined, CrownOutlined } from "@ant-design/icons";
import { API_DOMAIN } from "@/lib/configs";


const checkoutSchema = z.object({
  address: z.string().min(5, "Địa chỉ phải đủ chi tiết (ít nhất 5 ký tự)"),
  coupon_code: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

interface CheckoutModalProps {
  open: boolean;
  onCancel: () => void;
  totalPrice: number;
  items: any[];
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

export const CheckoutModal = ({ open, onCancel, totalPrice, items }: CheckoutModalProps) => {
  const { message } = App.useApp();
  const router = useRouter();
  const { mutate, isPending } = useCreateOrderMutation();
  const { data: me } = useMeQuery({ enabled: open });
  const { data: loyaltyData } = useLoyaltyQuery();

  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    finalPrice: number;
  } | null>(null);

  const [usePoints, setUsePoints] = useState(false);

  // Use latest loyalty data from separate API
  const currentPoints = loyaltyData?.points;
  const currentRank = loyaltyData?.rank;

  // Calculate points usage
  // Default logic: 1 point = 1 VND, max 20% discount
  const pointToVndRatio = 1;
  const maxDiscountPercentage = 20;

  const currentTotal = appliedCoupon ? appliedCoupon.finalPrice : totalPrice;
  const maxDiscountFromPoints = Math.floor(currentTotal * (maxDiscountPercentage / 100));
  const maxPointsAvailable = Math.min(currentPoints, Math.floor(maxDiscountFromPoints / pointToVndRatio));

  const pointsDiscountAmount = usePoints ? maxPointsAvailable * pointToVndRatio : 0;
  const finalOrderPrice = currentTotal - pointsDiscountAmount;

  const getRankColor = (rank?: string) => {
    switch (rank) {
      case "SILVER": return "text-slate-400 bg-slate-50 border-slate-200";
      case "GOLD": return "text-amber-500 bg-amber-50 border-amber-200";
      case "DIAMOND": return "text-cyan-500 bg-cyan-50 border-cyan-200";
      default: return "text-orange-600 bg-orange-50 border-orange-200";
    }
  };

  const getRankLabel = (rank?: string) => {
    switch (rank) {
      case "SILVER": return "Bạc";
      case "GOLD": return "Vàng";
      case "DIAMOND": return "Kim cương";
      default: return "Đồng";
    }
  };

  const getEarnRatio = (rank?: string) => {
    switch (rank) {
      case "SILVER": return 0.02;
      case "GOLD": return 0.03;
      case "DIAMOND": return 0.05;
      default: return 0.01;
    }
  };

  const expectedPoints = Math.floor(finalOrderPrice * getEarnRatio(currentRank));

  const { control, handleSubmit, formState: { errors }, reset, getValues, setValue } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { address: "", coupon_code: "" },
  });

  useEffect(() => {
    if (me?.address && open) {
      setValue("address", me.address);
    }
  }, [me, open, setValue]);

  const handleApplyCoupon = async () => {
    const code = getValues("coupon_code");
    if (!code) {
      message.warning("Vui lòng nhập mã giảm giá");
      return;
    }

    setCouponLoading(true);
    try {
      const result = await orderApi.validateCoupon(code);
      setAppliedCoupon({
        code: result.coupon.code,
        discountAmount: result.discountAmount,
        finalPrice: result.finalPrice
      });
      message.success("Áp dụng mã giảm giá thành công!");
    } catch (error: any) {
      // Chỉ hiện message lỗi nghiệp vụ (Local error)
      // Lỗi hệ thống đã được interceptor xử lý
      message.error(error.message);
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const onSubmit = (values: CheckoutFormValues) => {
    const payload = {
      address: values.address,
      coupon_code: appliedCoupon ? appliedCoupon.code : undefined,
      points_to_use: usePoints ? maxPointsAvailable : 0,
    };

    mutate(payload, {
      onSuccess: () => {
        message.success("Đặt hàng thành công!");
        reset();
        setAppliedCoupon(null);
        setUsePoints(false);
        onCancel();
        router.push("/orders");
      },
      onError: (err) => {
        message.error(err.message || "Đặt hàng thất bại");
      },
    });
  };

  const handleClose = () => {
    reset();
    setAppliedCoupon(null);
    setUsePoints(false);
    onCancel();
  };

  return (
    <Modal
      title={<span className="text-xl font-bold">Xác nhận Đặt hàng</span>}
      open={open}
      onCancel={handleClose}
      confirmLoading={isPending}
      onOk={() => handleSubmit(onSubmit)()}
      okText="Xác nhận & Đặt mua"
      cancelText="Hủy"
      okButtonProps={{ className: "bg-indigo-600 hover:bg-indigo-700 font-semibold" }}
      width={600}
    >
      <div className="py-2">
        {/* Customer Information Section */}
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Thông tin người mua</h4>
        <div className="bg-gray-50/80 p-4 rounded-xl mb-6 border border-gray-100 flex items-center gap-4">
          <Avatar
            size={54}
            src={me?.avatar}
            icon={<UserOutlined />}
            className="bg-indigo-100 text-indigo-600 border-2 border-white shadow-sm shrink-0"
          />
          <div className="flex-grow">
            <div className="flex items-center gap-2">
              <div className="font-bold text-gray-800 text-base">{me?.name || "Khách hàng"}</div>
              <Tag className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 border ${getRankColor(currentRank)}`}>
                <CrownOutlined /> {getRankLabel(currentRank)}
              </Tag>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
              <span className="text-xs text-gray-500 flex items-center gap-1.5 whitespace-nowrap">
                <UserOutlined className="text-[10px]" /> {me?.email}
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1.5 whitespace-nowrap">
                <PhoneOutlined className="text-[10px]" /> {me?.phone || "Chưa cập nhật SĐT"}
              </span>
            </div>
          </div>
        </div>

        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Tóm tắt đơn hàng</h4>
        <div className="max-h-[200px] overflow-y-auto pr-1 mb-6 border-b border-gray-50 pb-2">
          <div className="space-y-2.5">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start gap-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                    <img
                      src={item.cake.imageUrl || "https://placehold.co/100x100?text=No+Img"}
                      className="w-full h-full object-cover"
                      alt={item.cake.name}
                    />
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 text-[13px] line-clamp-1">{item.cake.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.variant ? (
                        <span className="text-[9px] font-black text-indigo-500 bg-indigo-50/50 px-1.5 py-0.5 rounded border border-indigo-100/30 uppercase">Size: {item.variant.size}</span>
                      ) : (
                        <span className="text-[9px] font-medium text-gray-400">Standard</span>
                      )}
                      <span className="text-xs text-gray-400 font-medium">x{item.quantity}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-700 text-[13px]">{formatPrice(item.price * item.quantity)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50/80 to-white p-4 rounded-xl mb-8 border border-indigo-100/50 shadow-sm relative overflow-hidden">
          <div className="flex justify-between mb-2">
            <span className="text-gray-500">Tạm tính ({items.length} món):</span>
            <span className="font-semibold text-gray-700">{formatPrice(totalPrice)}</span>
          </div>
          {appliedCoupon && (
            <div className="flex justify-between mb-2 text-green-600">
              <span className="flex items-center gap-1 font-medium"><CheckCircleOutlined /> Giảm giá ({appliedCoupon.code}):</span>
              <span className="font-semibold">-{formatPrice(appliedCoupon.discountAmount)}</span>
            </div>
          )}
          {usePoints && (
            <div className="flex justify-between mb-2 text-indigo-600">
              <span className="flex items-center gap-1 font-medium"><StarOutlined /> Dùng điểm tích lũy:</span>
              <span className="font-semibold">-{formatPrice(pointsDiscountAmount)}</span>
            </div>
          )}
          <Divider className="my-3 border-indigo-100/30" />
          <div className="flex justify-between text-lg">
            <span className="font-bold text-gray-800">Tổng thanh toán:</span>
            <span className="font-black text-indigo-600 text-2xl drop-shadow-sm">
              {formatPrice(finalOrderPrice)}
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-indigo-100/20 text-[11px] text-gray-400 italic leading-relaxed">
            <MailOutlined className="text-indigo-300 mr-1.5" />
            Email xác nhận đơn hàng sẽ được gửi đến <b>{me?.email}</b> sau khi đặt hàng thành công.
            {expectedPoints > 0 ? (
              <div className="mt-1 text-green-600 font-medium flex items-center gap-1">
                <StarOutlined className="text-[10px]" /> Bạn sẽ nhận được khoảng <b>{expectedPoints.toLocaleString()}</b> điểm sau khi đơn hàng hoàn thành.
              </div>
            ) : null}
          </div>
        </div>

        <Form layout="vertical">
          <div className="bg-white border border-indigo-50 rounded-xl p-4 mb-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <CrownOutlined className="text-amber-600 text-lg" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-800">Dùng điểm Cake Rewards</div>
                  <div className="text-[11px] text-gray-500">
                    Bạn có <span className="font-bold text-indigo-600">{currentPoints.toLocaleString()}</span> điểm.
                    Tối đa giảm 20% đơn hàng.
                  </div>
                </div>
              </div>
              <Switch
                checked={usePoints}
                onChange={setUsePoints}
                disabled={!currentPoints || currentPoints === 0}
              />
            </div>
            {usePoints && (
              <div className="mt-3 text-[11px] text-indigo-500 bg-indigo-50 px-3 py-2 rounded-lg flex justify-between items-center">
                <span>Số điểm sẽ sử dụng:</span>
                <span className="font-bold text-sm">-{maxPointsAvailable.toLocaleString()} pts</span>
              </div>
            )}
          </div>

          <Form.Item
            label={<span className="font-bold text-gray-700 flex items-center gap-1.5"><EnvironmentOutlined /> Địa chỉ nhận hàng</span>}
            validateStatus={errors.address ? "error" : ""}
            help={errors.address?.message}
            required
            className="mb-6"
          >
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <Input.TextArea
                  {...field}
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  placeholder="Ví dụ: 12 Đường ABC, Quận 1, TP HCM"
                  className="rounded-xl shadow-sm border-gray-200 focus:border-indigo-500 py-3"
                />
              )}
            />
          </Form.Item>

          <Form.Item label="Mã giảm giá (nếu có)">
            <div className="flex gap-2">
              <Controller
                name="coupon_code"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    prefix={<GiftOutlined className="text-gray-400" />}
                    placeholder="Nhập mã ưu đãi..."
                    className="rounded-lg uppercase font-mono"
                    disabled={!!appliedCoupon}
                  />
                )}
              />
              {appliedCoupon ? (
                <Button onClick={() => {
                  setAppliedCoupon(null);
                  setValue("coupon_code", "");
                }}>Hủy mã</Button>
              ) : (
                <Button
                  type="primary"
                  onClick={handleApplyCoupon}
                  loading={couponLoading}
                  className="bg-black hover:!bg-gray-800"
                >
                  Áp dụng
                </Button>
              )}
            </div>
            {appliedCoupon && (
              <div className="mt-2 text-xs text-green-600 font-medium">
                Mã giảm giá đã được áp dụng thành công!
              </div>
            )}
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};
