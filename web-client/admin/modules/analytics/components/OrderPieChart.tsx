"use client";

import { Card } from "antd";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface OrderPieChartProps {
  data: Array<{ name: string; value: number }>;
}

const COLORS = {
  PENDING: '#f59e0b',   // Amber
  CONFIRMED: '#3b82f6', // Blue
  DONE: '#10b981',      // Emerald
  REJECTED: '#ef4444',  // Red
};

const LABELS = {
  PENDING: 'Chờ duyệt',
  CONFIRMED: 'Đã xác nhận',
  DONE: 'Hoàn thành',
  REJECTED: 'Đã hủy',
};

export const OrderPieChart = ({ data }: OrderPieChartProps) => {
  const chartData = data.map(item => ({
    ...item,
    displayName: LABELS[item.name as keyof typeof LABELS] || item.name
  }));

  return (
    <Card className="rounded-3xl shadow-sm border border-gray-100 mt-6 h-full" title={<span className="font-extrabold text-gray-800">Trạng Thái Đơn Hàng</span>}>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={75}
              outerRadius={100}
              paddingAngle={8}
              dataKey="value"
              nameKey="displayName"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#94a3b8'} className="outline-none" />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', padding: '12px' }}
            />
            <Legend verticalAlign="bottom" align="center" iconType="circle" iconSize={8} wrapperStyle={{ paddingTop: '20px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

