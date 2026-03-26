"use client";

import { Card } from "antd";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface OrderPieChartProps {
  data: Array<{ name: string; value: number }>;
}

const COLORS = {
  PENDING: '#fa8c16',   // Orange
  CONFIRMED: '#1890ff', // Blue
  DONE: '#52c41a',      // Green
  REJECTED: '#f5222d',  // Red
};

export const OrderPieChart = ({ data }: OrderPieChartProps) => {
  return (
    <Card className="rounded-2xl shadow-sm border-none mt-6 h-full" title={<span className="font-bold">Trạng Thái Đơn Hàng</span>}>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#8884d8'} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Legend verticalAlign="bottom" align="center" iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
