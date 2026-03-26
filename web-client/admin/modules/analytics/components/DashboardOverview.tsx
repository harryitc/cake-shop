"use client";

import { useAnalyticsQuery } from "../hooks";
import { StatsCards } from "./StatsCards";
import { RevenueChart } from "./RevenueChart";
import { OrderPieChart } from "./OrderPieChart";
import { Row, Col, Card, Table, Skeleton, Empty } from "antd";

export const DashboardOverview = () => {
  const { data, isLoading, isError } = useAnalyticsQuery();

  if (isLoading) return <div className="p-8"><Skeleton active paragraph={{ rows: 15 }} /></div>;
  if (isError || !data) return <div className="p-20 text-center"><Empty description="Lỗi tải dữ liệu thống kê" /></div>;

  const bestSellerColumns = [
    {
      title: "Tên Bánh",
      dataIndex: "name",
      key: "name",
      className: "font-bold",
    },
    {
      title: "Đã Bán",
      dataIndex: "soldQuantity",
      key: "soldQuantity",
      render: (val: number) => <span className="text-indigo-600 font-bold">{val} chiếc</span>,
    },
    {
      title: "Doanh Thu",
      dataIndex: "revenue",
      key: "revenue",
      render: (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val),
    },
  ];

  return (
    <div className="p-2 md:p-0">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Bảng Điều Khiển</h1>
        <p className="text-gray-500 font-medium">Theo dõi hoạt động kinh doanh và hiệu suất bán hàng của tiệm.</p>
      </div>

      <StatsCards summary={data.summary} />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <RevenueChart data={data.revenueTimeline} />
        </Col>
        <Col xs={24} lg={8}>
          <OrderPieChart data={data.orderDistribution} />
        </Col>
      </Row>

      <Card className="rounded-2xl shadow-sm border-none mt-6" title={<span className="font-bold">Top 5 Sản Phẩm Bán Chạy Nhất</span>}>
        <Table 
          dataSource={data.bestSellers} 
          columns={bestSellerColumns} 
          pagination={false} 
          rowKey="name"
        />
      </Card>
    </div>
  );
};
