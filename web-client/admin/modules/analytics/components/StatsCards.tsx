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
  const formatVND = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} sm={12} lg={6}>
        <Card className="rounded-3xl shadow-md border-none overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)' }}>
          <div className="relative z-10">
            <Statistic
              title={<span className="text-white/70 font-bold text-sm uppercase tracking-wider">Tổng Doanh Thu</span>}
              value={summary.totalRevenue}
              formatter={(val) => <span className="text-white text-2xl font-black">{formatVND(Number(val))}</span>}
            />
            <div className="mt-4 flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white text-xl">
                <DollarOutlined />
              </div>
              <span className="text-white/40 text-xs font-medium italic">Đơn đã hoàn thành</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 text-white/10 text-8xl rotate-12 pointer-events-none">
            <DollarOutlined />
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card className="rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <Statistic
            title={<span className="text-gray-400 font-bold text-sm uppercase tracking-wider">Tổng Đơn Hàng</span>}
            value={summary.totalOrders}
            valueStyle={{ fontWeight: 900, fontSize: '28px', color: '#1f2937' }}
          />
          <div className="mt-4 flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 text-xl">
              <ShoppingCartOutlined />
            </div>
            <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded text-[10px]">TẤT CẢ</span>
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card className="rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <Statistic
            title={<span className="text-gray-400 font-bold text-sm uppercase tracking-wider">Đơn Chờ Xử Lý</span>}
            value={summary.pendingOrders}
            valueStyle={{ fontWeight: 900, fontSize: '28px', color: '#f59e0b' }}
          />
          <div className="mt-4 flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 text-xl">
              <ClockCircleOutlined />
            </div>
            <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded text-[10px]">CẦN DUYỆT</span>
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card className="rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <Statistic
            title={<span className="text-gray-400 font-bold text-sm uppercase tracking-wider">Loại Bánh</span>}
            value={summary.totalCakes}
            valueStyle={{ fontWeight: 900, fontSize: '28px', color: '#10b981' }}
          />
          <div className="mt-4 flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 text-xl">
              <ShopOutlined />
            </div>
            <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">MENU</span>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

