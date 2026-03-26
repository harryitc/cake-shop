"use client";

import { useOrdersQuery } from "../hooks";
import { List, Tag, Empty, Skeleton, Button, Space, Divider } from "antd";
import { useRouter } from "next/navigation";
import { IOrder } from "../types";
import { useState } from "react";
import { ReviewModal } from "../../cakes/components/ReviewModal";
import { StarOutlined } from "@ant-design/icons";

export const OrderList = () => {
  const router = useRouter();
  const { data: orders, isLoading, isError } = useOrdersQuery();
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedItemForReview, setSelectedItemForReview] = useState<{ cakeId: string, orderId: string, cakeName: string } | null>(null);

  if (isLoading) return <div className="p-8 max-w-4xl mx-auto"><Skeleton active paragraph={{ rows: 8 }} /></div>;
  if (isError) return <div className="p-8 text-center text-red-500">Không thể tải danh sách đơn hàng.</div>;
  if (!orders || orders.length === 0) return (
    <div className="py-20 text-center max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100">
      <Empty description={<span className="text-gray-500 text-lg">Bạn chưa có đơn hàng nào</span>} />
      <Button type="primary" size="large" className="mt-6 bg-indigo-600 font-semibold h-12 rounded-xl" onClick={() => router.push("/cakes")}>
        Khám phá bánh ngon
      </Button>
    </div>
  );

  const getStatusTag = (status: string) => {
    switch (status) {
      case "PENDING": return <Tag color="gold" className="px-3 py-1 font-semibold rounded-md border-amber-300">Chờ xác nhận</Tag>;
      case "CONFIRMED": return <Tag color="green" className="px-3 py-1 font-semibold rounded-md border-green-300">Đã xác nhận</Tag>;
      case "DONE": return <Tag color="success" className="px-3 py-1 font-semibold rounded-md border-blue-400">Hoàn thành</Tag>;
      case "REJECTED": return <Tag color="error" className="px-3 py-1 font-semibold rounded-md">Bị hủy</Tag>;
      default: return <Tag color="default">{status}</Tag>;
    }
  };

  const handleReviewClick = (cakeId: string, orderId: string, cakeName: string) => {
    setSelectedItemForReview({ cakeId, orderId, cakeName });
    setReviewModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8">Lịch sử Đơn Hàng</h1>
      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={orders}
        renderItem={(order: IOrder) => (
          <List.Item>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 transition-all hover:shadow-md">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-gray-400 font-mono">#{order.id.slice(-6).toUpperCase()}</span>
                    {getStatusTag(order.status)}
                  </div>
                  <div className="mb-2 space-y-1 mt-3">
                    <span className="text-gray-600 text-[15px] block">Thời gian đặt: {order.formattedDate}</span>
                    <span className="text-gray-600 text-[15px] block max-w-lg truncate" title={order.address}>Giao đến: <span className="font-medium text-gray-800">{order.address}</span></span>
                    <span className="text-gray-600 text-[15px] block pt-1">
                      Tổng tiền: 
                      {order.discount_amount && order.discount_amount > 0 ? (
                        <span className="ml-2">
                          <span className="line-through text-gray-400 mr-2">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.totalPrice)}</span>
                          <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{order.formattedTotal}</span>
                          <Tag color="green" className="ml-2 border-none bg-green-50 text-green-600 text-xs">Mã: {order.coupon_code}</Tag>
                        </span>
                      ) : (
                        <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md ml-2">{order.formattedTotal}</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <Divider className="my-2" />

              <div className="space-y-4">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center bg-gray-50/50 p-3 rounded-xl border border-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-lg border border-gray-100 overflow-hidden">
                        <img
                          src={item?.cake_id?.image_url ? (item?.cake_id?.image_url.startsWith('http') ? item?.cake_id?.image_url : `http://localhost:5000${item?.cake_id.image_url}`) : "https://placehold.co/100x100?text=Cake"}
                          alt="cake"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-gray-800">{item?.cake_id?.name}</div>
                        <div className="text-xs text-gray-400">Số lượng: {item.quantity} | Giá: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.price_at_buy)}</div>
                      </div>
                    </div>
                    {order.status === 'DONE' && (
                      <Button
                        icon={<StarOutlined />}
                        onClick={() => handleReviewClick(item?.cake_id?._id || item?.cake_id, order.id, item?.cake_id?.name)}
                        className="rounded-lg font-semibold hover:border-indigo-400 hover:text-indigo-600"
                      >
                        Đánh giá
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </List.Item>
        )}
      />

      {selectedItemForReview && (
        <ReviewModal
          open={reviewModalOpen}
          onCancel={() => setReviewModalOpen(false)}
          cakeId={selectedItemForReview.cakeId}
          orderId={selectedItemForReview.orderId}
          cakeName={selectedItemForReview.cakeName}
        />
      )}
    </div>
  );
};
