"use client";

import { useAnalyticsQuery } from "../hooks";
import { StatsCards } from "./StatsCards";
import { RevenueChart } from "./RevenueChart";
import { OrderPieChart } from "./OrderPieChart";
import { Row, Col, Card, Table, Skeleton, Empty } from "antd";

export const DashboardOverview = () => {
  const { data, isLoading, isError } = useAnalyticsQuery();

  if (isLoading) return <div className="p-8"><Skeleton active paragraph={{ rows: 15 }} /></div>;
  if (isError || !data) return (
    <div className="min-h-[60vh] flex items-center justify-center bg-white rounded-3xl border border-dashed border-gray-200">
      <Empty description={<span className="text-gray-400 font-medium">Lỗi tải dữ liệu thống kê. Vui lòng thử lại sau.</span>} />
    </div>
  );

  const bestSellerColumns = [
    {
      title: <span className="text-gray-400 uppercase text-[11px] font-bold tracking-widest">Tên Bánh</span>,
      dataIndex: "name",
      key: "name",
      render: (val: string) => <span className="font-bold text-gray-800">{val}</span>,
    },
    {
      title: <span className="text-gray-400 uppercase text-[11px] font-bold tracking-widest">Đã Bán</span>,
      dataIndex: "soldQuantity",
      key: "soldQuantity",
      render: (val: number) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600">
          {val} chiếc
        </span>
      ),
    },
    {
      title: <span className="text-gray-400 uppercase text-[11px] font-bold tracking-widest text-right block">Doanh Thu</span>,
      dataIndex: "revenue",
      key: "revenue",
      align: 'right' as const,
      render: (val: number) => <span className="font-black text-gray-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)}</span>,
    },
  ];

  return (
    <div className="pb-10">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Bảng Điều Khiển</h1>
        <p className="text-gray-500 font-medium mt-1">Chào mừng quay trở lại! Đây là tóm tắt hoạt động kinh doanh của bạn.</p>
      </div>

      <StatsCards summary={data.summary} />

      <Row gutter={[24, 24]} className="mt-8">
        <Col xs={24} lg={16}>
          <RevenueChart data={data.revenueTimeline} />
        </Col>
        <Col xs={24} lg={8}>
          <OrderPieChart data={data.orderDistribution} />
        </Col>
      </Row>

      <Card 
        className="rounded-3xl shadow-sm border border-gray-100 mt-8 overflow-hidden" 
        title={<span className="font-extrabold text-gray-800">Top 5 Sản Phẩm Bán Chạy Nhất</span>}
        bodyStyle={{ padding: 0 }}
      >
        <Table 
          dataSource={data.bestSellers} 
          columns={bestSellerColumns} 
          pagination={false} 
          rowKey="name"
          className="border-none"
        />
      </Card>
    </div>
  );
};

