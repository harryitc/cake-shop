"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal, Form, Input, App, Button, Tag, Divider, Avatar } from "antd";
import { useCreateOrderMutation } from "../hooks";
import { useMeQuery } from "../../auth/hooks";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { httpClient } from "@/lib/http";
import { GiftOutlined, CheckCircleOutlined, UserOutlined, PhoneOutlined, EnvironmentOutlined, StarOutlined, MailOutlined } from "@ant-design/icons";
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
      width={600}
    >
      <div className="py-2">
        {/* Customer Information Section */}
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Thông tin người mua</h4>
        <div className="bg-gray-50/80 p-4 rounded-xl mb-6 border border-gray-100 flex items-center gap-4">
           <Avatar 
             size={54} 
             src={me?.avatar_url ? (me.avatar_url.startsWith('http') ? me.avatar_url : `${API_DOMAIN}${me.avatar_url}`) : undefined}
             icon={<UserOutlined />}
             className="bg-indigo-100 text-indigo-600 border-2 border-white shadow-sm shrink-0"
           />
           <div className="flex-grow">
              <div className="font-bold text-gray-800 text-base">{me?.full_name || "Khách hàng"}</div>
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
                      src={item.cake.image_url ? (item.cake.image_url.startsWith('http') ? item.cake.image_url : `${API_DOMAIN}${item.cake.image_url}`) : "https://placehold.co/100x100"} 
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
                  <div className="font-bold text-gray-700 text-[13px]">{formatPrice((item.price || item.cake.price) * item.quantity)}</div>
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
           <Divider className="my-3 border-indigo-100/30" />
           <div className="flex justify-between text-lg">
              <span className="font-bold text-gray-800">Tổng thanh toán:</span>
              <span className="font-black text-indigo-600 text-2xl drop-shadow-sm">
                {formatPrice(appliedCoupon ? appliedCoupon.finalPrice : totalPrice)}
              </span>
           </div>
           <div className="mt-4 pt-3 border-t border-indigo-100/20 text-[11px] text-gray-400 italic leading-relaxed">
              <MailOutlined className="text-indigo-300 mr-1.5" /> 
              Email xác nhận đơn hàng sẽ được gửi đến <b>{me?.email}</b> sau khi đặt hàng thành công.
           </div>
        </div>

        <Form layout="vertical">
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
