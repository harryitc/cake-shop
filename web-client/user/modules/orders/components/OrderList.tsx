"use client";

import { useOrdersQuery } from "../hooks";
import { List, Tag, Empty, Skeleton, Button } from "antd";
import { useRouter } from "next/navigation";
import { IOrder } from "../types";

export const OrderList = () => {
  const router = useRouter();
  const { data: orders, isLoading, isError } = useOrdersQuery();

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
    switch(status) {
      case "PENDING": return <Tag color="gold" className="px-3 py-1 font-semibold rounded-md border-amber-300">Chờ xác nhận</Tag>;
      case "CONFIRMED": return <Tag color="green" className="px-3 py-1 font-semibold rounded-md border-green-300">Đã xác nhận</Tag>;
      case "DONE": return <Tag color="success" className="px-3 py-1 font-semibold rounded-md border-blue-400">Hoàn thành</Tag>;
      case "REJECTED": return <Tag color="error" className="px-3 py-1 font-semibold rounded-md">Bị hủy</Tag>;
      default: return <Tag color="default">{status}</Tag>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8">Lịch sử Đơn Hàng</h1>
      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={orders}
        renderItem={(order: IOrder) => (
          <List.Item>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:shadow-md">
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm text-gray-400 font-mono">#{order.id.slice(-6).toUpperCase()}</span>
                  {getStatusTag(order.status)}
                </div>
                <div className="mb-2 space-y-1 mt-3">
                  <span className="text-gray-600 text-[15px] block">Thời gian đặt: {order.formattedDate}</span>
                  <span className="text-gray-600 text-[15px] block max-w-lg truncate" title={order.address}>Giao đến: <span className="font-medium text-gray-800">{order.address}</span></span>
                  <span className="text-gray-600 text-[15px] block pt-1">Tổng số: <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{order.itemsCount}</span> sản phẩm</span>
                </div>
              </div>
              <div className="flex flex-col items-start md:items-end w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
                <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Thành Tiền</span>
                <span className="text-2xl font-black text-indigo-600">{order.formattedTotal}</span>
              </div>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
};
