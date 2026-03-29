"use client";

import { Drawer, Tag, Divider, Button, Typography, Space, message } from "antd";
import { ClockCircleOutlined, EnvironmentOutlined, WalletOutlined, StarOutlined, CrownOutlined, ShoppingOutlined, CloseOutlined } from "@ant-design/icons";
import { IOrder } from "../types";
import { API_DOMAIN } from "@/lib/configs";
import { useAddToCartMutation } from "../../cart/hooks";
import { useRouter } from "next/navigation";

const { Text } = Typography;

interface OrderDetailDrawerProps {
  order: IOrder | null;
  open: boolean;
  onClose: () => void;
  onReview: (cakeId: string, cakeName: string) => void;
}

export const OrderDetailDrawer = ({ order, open, onClose, onReview }: OrderDetailDrawerProps) => {
  const router = useRouter();
  const addToCartMutation = useAddToCartMutation();

  if (!order) return null;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

  const getStatusTag = (status: string) => {
    switch (status) {
      case "PENDING": return <Tag color="gold" className="rounded-full px-3 border-amber-200">Chờ xác nhận</Tag>;
      case "CONFIRMED": return <Tag color="green" className="rounded-full px-3 border-green-200">Đã xác nhận</Tag>;
      case "DONE": return <Tag color="blue" className="rounded-full px-3 border-blue-200">Hoàn thành</Tag>;
      case "REJECTED": return <Tag color="error" className="rounded-full px-3 border-red-200">Đã hủy</Tag>;
      default: return <Tag className="rounded-full px-3">{status}</Tag>;
    }
  };

  const handleBuyAgain = async () => {
    try {
      if (!order.items || order.items.length === 0) return;

      const itemsToAdd = order.items.map(item => ({
        cake_id: item.cake.id,
        quantity: item.quantity,
        variant_id: item.variant_id
      }));

      await addToCartMutation.mutateAsync(itemsToAdd);
      message.success("Đã thêm sản phẩm. Đang chuyển đến trang thanh toán...");
      router.push("/checkout");
      onClose();
    } catch (err: any) {
      message.error(err.message || "Không thể thực hiện mua lại");
    }
  };

  return (
    <Drawer
      title={null}
      placement="right"
      onClose={onClose}
      open={open}
      width={600}
      closeIcon={null}
      className="compact-order-drawer"
      styles={{ body: { padding: 0 } }}
    >
      {/* Header Custom */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-6 py-5 border-b border-gray-100 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Chi tiết đơn hàng</span>
          <span className="text-xl font-black text-gray-900 leading-tight tracking-tight">#{order.id.slice(-6).toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-3">
          {getStatusTag(order.status)}
          <Button
            type="text"
            icon={<CloseOutlined className="text-gray-400" />}
            onClick={onClose}
            className="hover:bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center"
          />
        </div>
      </div>

      <div className="p-6 flex flex-col gap-8">
        {/* Basic Info */}
        <section className="bg-gray-50/50 p-5 rounded-[24px] border border-gray-100 flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0 border border-gray-100">
              <ClockCircleOutlined className="text-indigo-500 text-lg" />
            </div>
            <div>
              <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Thời gian đặt</div>
              <div className="text-[15px] font-bold text-gray-800">{order.formattedDate}</div>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0 border border-gray-100">
              <EnvironmentOutlined className="text-indigo-500 text-lg" />
            </div>
            <div>
              <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Giao đến</div>
              <div className="text-[14px] font-medium text-gray-600 leading-relaxed">{order.address}</div>
            </div>
          </div>
        </section>

        {/* Product List */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <ShoppingOutlined className="text-indigo-400" /> Sản phẩm ({order.itemsCount})
            </h4>
          </div>
          <div className="flex flex-col gap-3">
            {order.items?.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-2xl border border-gray-100 hover:border-indigo-200 transition-colors">
                <div className="flex gap-4 items-center">
                  <div className="w-14 h-14 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden shrink-0">
                    <img
                      src={item.cake?.imageUrl || "https://placehold.co/100x100?text=No+Img"}
                      alt={item.cake?.name || "Product"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm leading-tight mb-1">{item.cake?.name || "Sản phẩm không khả dụng"}</div>
                    <div className="flex items-center gap-2">
                      {item.variant_size && (
                        <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-tighter">Size: {item.variant_size}</span>
                      )}
                      <span className="text-xs text-gray-400 font-bold font-mono">x{item.quantity || 0}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1.5">
                  <div className="font-black text-gray-800 text-sm">{item.formattedTotalPrice || "0 đ"}</div>
                  {order.status === 'DONE' && (
                    <Button
                      type="text"
                      size="small"
                      icon={<StarOutlined className="text-amber-500" />}
                      onClick={() => onReview(item.cake?.id, item.cake?.name)}
                      className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 hover:bg-amber-100 border-none h-7 px-3 rounded-lg"
                    >
                      Đánh giá
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Loyalty Reward (Dynamic) */}
        {order.points_earned && order.points_earned > 0 ? (
          <section className="bg-gradient-to-br from-amber-50 to-orange-50/30 rounded-3xl p-6 border border-amber-100/50 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10">
              <CrownOutlined className="text-8xl text-amber-600 rotate-12" />
            </div>
            <div className="flex items-center gap-4 mb-3 relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-md shadow-amber-200/50 shrink-0">
                <CrownOutlined className="text-amber-500 text-lg" />
              </div>
              <div>
                <div className="text-[10px] text-amber-600 font-black uppercase tracking-[0.2em] mb-0.5">Phần thưởng Member</div>
                <div className="text-lg font-black text-amber-900">+{order.points_earned.toLocaleString()} pts</div>
              </div>
            </div>
            <p className="text-[11px] text-amber-700 font-medium italic mb-0 leading-relaxed opacity-80">
              Bạn đã tích lũy thêm được một lượng điểm đáng kể từ đơn hàng này. Chúc mừng bạn!
            </p>
          </section>
        ) : null}

        {/* Bill Breakdown */}
        <section className="bg-indigo-600 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-100">
          <div className="flex items-center gap-3 mb-6">
            <WalletOutlined className="text-indigo-200 text-xl" />
            <h4 className="text-[12px] font-black uppercase tracking-[0.2em] mb-0 text-indigo-100">Hóa đơn thanh toán</h4>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-indigo-100/70 text-sm font-medium">Tạm tính:</span>
              <span className="font-bold text-sm text-white">{formatPrice(order.totalPrice)}</span>
            </div>
            {order.coupon_code && order.discount_amount && order.discount_amount > 0 ? (
              <div className="flex justify-between items-center text-sm">
                <span className="text-indigo-100/70 font-medium">Mã ưu đãi ({order.coupon_code}):</span>
                <span className="font-bold text-green-300">-{formatPrice(order.discount_amount)}</span>
              </div>
            ) : null}
            {order.points_discount_amount && order.points_discount_amount > 0 ? (
              <div className="flex justify-between items-center text-sm">
                <span className="text-indigo-100/70 font-medium flex items-center gap-1">Dùng {order.points_used} pts:</span>
                <span className="font-bold text-amber-300">-{formatPrice(order.points_discount_amount)}</span>
              </div>
            ) : null}
            <div className="pt-5 border-t border-indigo-500/50 mt-4 flex justify-between items-center">
              <span className="font-black text-xs uppercase tracking-[0.2em] text-indigo-100">Tổng cộng</span>
              <span className="text-3xl font-black text-white tracking-tighter">{order.formattedTotal}</span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <Button className="h-12 rounded-2xl font-black uppercase text-[11px] tracking-widest border-2 border-gray-100 text-gray-500">Hỗ trợ</Button>
          <Button 
            type="primary" 
            className="h-12 rounded-2xl font-black uppercase text-[11px] tracking-widest bg-indigo-600 shadow-lg shadow-indigo-200"
            onClick={handleBuyAgain}
            loading={addToCartMutation.isPending}
          >
            Mua lại ngay
          </Button>
        </div>
      </div>
    </Drawer>
  );
};
