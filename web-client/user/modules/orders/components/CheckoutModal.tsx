"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal, Form, Input, App, Button, Tag, Divider } from "antd";
import { useCreateOrderMutation } from "../hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { httpClient } from "@/lib/http";
import { GiftOutlined, CheckCircleOutlined } from "@ant-design/icons";

const checkoutSchema = z.object({
  address: z.string().min(5, "Địa chỉ phải đủ chi tiết (ít nhất 5 ký tự)"),
  coupon_code: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

interface CheckoutModalProps {
  open: boolean;
  onCancel: () => void;
  totalPrice: number;
}

const formatPrice = (price: number) => 
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

export const CheckoutModal = ({ open, onCancel, totalPrice }: CheckoutModalProps) => {
  const { message } = App.useApp();
  const router = useRouter();
  const { mutate, isPending } = useCreateOrderMutation();
  
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    finalPrice: number;
  } | null>(null);

  const { control, handleSubmit, formState: { errors }, reset, getValues, setValue } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { address: "", coupon_code: "" },
  });

  const handleApplyCoupon = async () => {
    const code = getValues("coupon_code");
    if (!code) {
      message.warning("Vui lòng nhập mã giảm giá");
      return;
    }

    setCouponLoading(true);
    try {
      const result = await httpClient<any>("/coupons/validate", {
        method: "POST",
        body: JSON.stringify({ code, order_total: totalPrice })
      });
      setAppliedCoupon({
        code: result.coupon.code,
        discountAmount: result.discountAmount,
        finalPrice: result.finalPrice
      });
      message.success("Áp dụng mã giảm giá thành công!");
    } catch (error: any) {
      message.error(error.message || "Mã giảm giá không hợp lệ");
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const onSubmit = (values: CheckoutFormValues) => {
    const payload = {
      address: values.address,
      coupon_code: appliedCoupon ? appliedCoupon.code : undefined,
    };

    mutate(payload, {
      onSuccess: () => {
        message.success("Đặt hàng thành công!");
        reset();
        setAppliedCoupon(null);
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
      width={500}
    >
      <div className="py-4">
        <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100">
           <div className="flex justify-between mb-2">
              <span className="text-gray-500">Tạm tính:</span>
              <span className="font-semibold">{formatPrice(totalPrice)}</span>
           </div>
           {appliedCoupon && (
             <div className="flex justify-between mb-2 text-green-600">
                <span className="flex items-center gap-1"><CheckCircleOutlined /> Giảm giá ({appliedCoupon.code}):</span>
                <span className="font-semibold">-{formatPrice(appliedCoupon.discountAmount)}</span>
             </div>
           )}
           <Divider className="my-2" />
           <div className="flex justify-between text-lg">
              <span className="font-bold">Tổng cộng:</span>
              <span className="font-bold text-indigo-600">
                {formatPrice(appliedCoupon ? appliedCoupon.finalPrice : totalPrice)}
              </span>
           </div>
        </div>

        <Form layout="vertical">
          <Form.Item
            label="Địa chỉ giao hàng đầy đủ"
            validateStatus={errors.address ? "error" : ""}
            help={errors.address?.message}
            required
          >
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <Input.TextArea 
                  {...field} 
                  autoSize={{ minRows: 2, maxRows: 4 }} 
                  placeholder="Ví dụ: 12 Đường ABC, Quận 1, TP HCM" 
                  className="rounded-lg shadow-sm"
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
                    placeholder="Nhập mã giảm giá..." 
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
