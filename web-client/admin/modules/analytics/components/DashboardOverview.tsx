"use client";

import { useAnalyticsQuery } from "../hooks";
import { StatsCards } from "./StatsCards";
import { RevenueChart } from "./RevenueChart";
import { OrderPieChart } from "./OrderPieChart";
import { CategorySalesChart } from "./CategorySalesChart";
import { RecentOrdersTable } from "./RecentOrdersTable";
import { Row, Col, Card, Table, Skeleton, Empty, Avatar, Space } from "antd";

export const DashboardOverview = () => {
  const { data, isLoading, isError } = useAnalyticsQuery();

  if (isLoading) return <div className="p-8"><Skeleton active paragraph={{ rows: 15 }} /></div>;
  if (isError || !data) return (
    <div className="min-h-[60vh] flex items-center justify-center bg-white rounded-xl border border-dashed border-gray-200">
      <Empty description={<span className="text-gray-400 font-medium">Lỗi tải dữ liệu thống kê. Vui lòng thử lại sau.</span>} />
    </div>
  );

  const bestSellerColumns = [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (val: string, record: any) => (
        <Space size="middle">
          <Avatar 
            shape="square" 
            size={48} 
            src={record.image_url} 
            className="rounded-lg border border-gray-50"
          >
            {val[0]}
          </Avatar>
          <div>
            <div className="font-bold text-gray-800">{val}</div>
            <div className="text-[11px] text-gray-400">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.price)}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Số lượng bán",
      dataIndex: "soldQuantity",
      key: "soldQuantity",
      align: 'center' as const,
      render: (val: number) => (
        <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-600">
          {val} chiếc
        </span>
      ),
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      align: 'right' as const,
      render: (val: number) => <span className="font-bold text-gray-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)}</span>,
    },
  ];

  return (
    <div className="pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Báo cáo Tổng quan</h1>
        <p className="text-gray-500 font-medium">Chào mừng trở lại! Theo dõi hiệu quả kinh doanh của cửa hàng.</p>
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

      <Row gutter={[24, 24]} className="mt-8">
        <Col xs={24} lg={12}>
           <Card 
            className="rounded-xl border border-gray-100 shadow-sm overflow-hidden h-full" 
            title={<span className="font-bold text-gray-800">Top 5 Sản phẩm bán chạy</span>}
            bodyStyle={{ padding: 0 }}
          >
            <Table 
              dataSource={data.bestSellers} 
              columns={bestSellerColumns} 
              pagination={false} 
              rowKey="name"
              className="custom-table"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <CategorySalesChart data={data.categoryDistribution} />
        </Col>
      </Row>

      <div className="mt-8">
        <RecentOrdersTable data={data.recentOrders} />
      </div>
    </div>
  );
};
