"use client";

import { Card, Col, Row, Statistic } from "antd";
import { DollarOutlined, ShoppingCartOutlined, ClockCircleOutlined, ShopOutlined } from "@ant-design/icons";

interface StatsCardsProps {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    totalCakes: number;
  };
}

export const StatsCards = ({ summary }: StatsCardsProps) => {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <Card className="rounded-2xl shadow-sm border-none bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <Statistic
            title={<span className="text-white/80 font-medium">Tổng Doanh Thu</span>}
            value={summary.totalRevenue}
            prefix={<DollarOutlined />}
            suffix="₫"
            valueStyle={{ color: "#fff", fontWeight: 900 }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card className="rounded-2xl shadow-sm border-none">
          <Statistic
            title={<span className="text-gray-500 font-medium">Tổng Đơn Hàng</span>}
            value={summary.totalOrders}
            prefix={<ShoppingCartOutlined className="text-indigo-500" />}
            valueStyle={{ fontWeight: 900 }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card className="rounded-2xl shadow-sm border-none">
          <Statistic
            title={<span className="text-gray-500 font-medium">Đơn Chờ Xử Lý</span>}
            value={summary.pendingOrders}
            prefix={<ClockCircleOutlined className="text-orange-500" />}
            valueStyle={{ fontWeight: 900, color: "#fa8c16" }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card className="rounded-2xl shadow-sm border-none">
          <Statistic
            title={<span className="text-gray-500 font-medium">Loại Bánh Đang Bán</span>}
            value={summary.totalCakes}
            prefix={<ShopOutlined className="text-green-500" />}
            valueStyle={{ fontWeight: 900 }}
          />
        </Card>
      </Col>
    </Row>
  );
};
