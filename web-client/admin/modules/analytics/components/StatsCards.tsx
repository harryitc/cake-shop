"use client";

import { Card, Col, Row, Statistic } from "antd";
import { 
  DollarOutlined, 
  ShoppingCartOutlined, 
  ClockCircleOutlined, 
  RiseOutlined,
  BarChartOutlined 
} from "@ant-design/icons";

interface StatsCardsProps {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    totalCakes: number;
    averageOrderValue: number;
  };
}

const formatVND = (val: number) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

export const StatsCards = ({ summary }: StatsCardsProps) => {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <Card className="rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 h-full">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-gray-500 text-[13px] font-semibold uppercase tracking-wider mb-1">Doanh thu</p>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{formatVND(summary.totalRevenue)}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 text-xl">
              <DollarOutlined />
            </div>
          </div>
          <div className="flex items-center text-[12px] text-emerald-600 font-medium">
            <RiseOutlined className="mr-1" />
            <span>Đơn đã hoàn thành</span>
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card className="rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 h-full">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-gray-500 text-[13px] font-semibold uppercase tracking-wider mb-1">Tổng đơn hàng</p>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{summary.totalOrders}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 text-xl">
              <ShoppingCartOutlined />
            </div>
          </div>
          <div className="flex items-center text-[12px] text-gray-500 font-medium">
            <span className="bg-gray-100 px-2 py-0.5 rounded mr-2">TẤT CẢ</span>
            <span>{summary.completedOrders} đơn thành công</span>
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card className="rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 h-full">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-gray-500 text-[13px] font-semibold uppercase tracking-wider mb-1">Giá trị trung bình</p>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{formatVND(summary.averageOrderValue)}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 text-xl">
              <BarChartOutlined />
            </div>
          </div>
          <div className="flex items-center text-[12px] text-gray-500 font-medium">
             <span>AOV mỗi đơn hàng</span>
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card className="rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 h-full">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-gray-500 text-[13px] font-semibold uppercase tracking-wider mb-1">Chờ xử lý</p>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{summary.pendingOrders}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 text-xl">
              <ClockCircleOutlined />
            </div>
          </div>
          <div className="flex items-center text-[12px] text-amber-600 font-medium">
             <span>Cần được phê duyệt ngay</span>
          </div>
        </Card>
      </Col>
    </Row>
  );
};
