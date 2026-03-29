"use client";

import { Tag, Button, Empty, Skeleton, Space } from "antd";
import { useMyOrdersQuery } from "../hooks";
import { ReviewModal } from "../../cakes/components/ReviewModal";
import { OrderDetailDrawer } from "./OrderDetailDrawer";
import { useState } from "react";
import { IOrder } from "../types";
import { StarOutlined, EyeOutlined, ShoppingOutlined } from "@ant-design/icons";

export const OrderList = ({ hideHeader = false }: { hideHeader?: boolean }) => {
  const { data: orders, isLoading, isError } = useMyOrdersQuery();
  const [selectedItemForReview, setSelectedItemForReview] = useState<{ cakeId: string, orderId: string, cakeName: string } | null>(null);
  
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (isLoading) return <div className="p-10"><Skeleton active paragraph={{ rows: 5 }} /></div>;
  if (isError) return <div className="p-10 text-center text-red-500 font-bold bg-white rounded-xl shadow-sm border border-gray-100 italic">Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.</div>;

  if (!orders || orders.length === 0) return (
    <div className="py-16 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
      <Empty description={<span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Bạn chưa có đơn hàng nào</span>} />
    </div>
  );

  const getStatusTag = (status: string) => {
    switch (status) {
      case "PENDING": return <Tag color="gold" className="m-0 rounded-full px-2 text-[9px] font-black uppercase">Chờ duyệt</Tag>;
      case "CONFIRMED": return <Tag color="green" className="m-0 rounded-full px-2 text-[9px] font-black uppercase">Đã duyệt</Tag>;
      case "DONE": return <Tag color="blue" className="m-0 rounded-full px-2 text-[9px] font-black uppercase">Đã xong</Tag>;
      case "REJECTED": return <Tag color="error" className="m-0 rounded-full px-2 text-[9px] font-black uppercase">Đã hủy</Tag>;
      default: return <Tag className="m-0 rounded-full px-2 text-[9px] font-black uppercase">{status}</Tag>;
    }
  };

  const handleOpenDrawer = (order: IOrder) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  const handleReviewClickFromDrawer = (cakeId: string, cakeName: string) => {
    if (selectedOrder) {
      setSelectedItemForReview({ 
        cakeId, 
        orderId: selectedOrder.id, 
        cakeName 
      });
    }
  };

  return (
    <div className="w-full">
      {!hideHeader && (
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
            Lịch sử mua hàng
          </h1>
          <div className="text-gray-400 font-bold text-xs bg-gray-100 px-3 py-1.5 rounded-xl">
            {orders.length} Đơn
          </div>
        </div>
      )}
      
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-7 gap-3 px-6 py-3 bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
          <div className="col-span-1">Mã đơn</div>
          <div className="col-span-1">Ngày đặt</div>
          <div className="col-span-1">Số lượng</div>
          <div className="col-span-1 text-right">Tổng tiền</div>
          <div className="col-span-1 text-center">Trạng thái</div>
          <div className="col-span-1 text-center">Tích điểm</div>
          <div className="col-span-1 text-right">Thao tác</div>
        </div>

        {/* Order Rows */}
        <div className="flex flex-col">
          {orders.map((order: IOrder) => (
            <div 
              key={order.id} 
              className="grid grid-cols-1 md:grid-cols-7 gap-3 px-6 py-4 items-center hover:bg-indigo-50/20 transition-colors border-b border-gray-50 last:border-none group cursor-pointer"
              onClick={() => handleOpenDrawer(order)}
            >
              {/* Mobile Info */}
              <div className="md:col-span-1 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-white transition-colors">
                  <ShoppingOutlined className="text-indigo-600 text-base" />
                </div>
                <span className="font-mono font-bold text-gray-500 text-xs group-hover:text-indigo-600 transition-colors">#{order.id.slice(-6).toUpperCase()}</span>
              </div>

              <div className="md:col-span-1 text-xs font-bold text-gray-400">
                {order.formattedDate.split(' ')[0]}
              </div>

              <div className="md:col-span-1 text-xs font-bold text-gray-400">
                {order.itemsCount} món
              </div>

              <div className="md:col-span-1 text-right">
                <span className="font-black text-gray-800 text-xs">{order.formattedTotal}</span>
              </div>

              <div className="md:col-span-1 flex justify-center">
                {getStatusTag(order.status)}
              </div>

              <div className="md:col-span-1 flex justify-center">
                {order.points_earned && order.points_earned > 0 ? (
                  <Tag color="orange" className="m-0 border-none bg-amber-50 text-amber-600 text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <StarOutlined className="text-[8px]" /> +{order.points_earned}
                  </Tag>
                ) : (
                  <span className="text-gray-200 text-xs">-</span>
                )}
              </div>

              <div className="md:col-span-1 text-right">
                <Button 
                  type="text" 
                  size="small"
                  icon={<EyeOutlined />} 
                  className="text-indigo-500 font-black hover:bg-indigo-50 rounded-lg text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDrawer(order);
                  }}
                >
                  Xem
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <OrderDetailDrawer 
        order={selectedOrder}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onReview={handleReviewClickFromDrawer}
      />

      <ReviewModal 
        open={!!selectedItemForReview}
        onCancel={() => setSelectedItemForReview(null)}
        cakeId={selectedItemForReview?.cakeId || ""}
        orderId={selectedItemForReview?.orderId || ""}
        cakeName={selectedItemForReview?.cakeName || ""}
      />
    </div>
  );
};
