"use client";

import { Card } from "antd";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface RevenueChartProps {
  data: Array<{ date: string; revenue: number; orderCount: number }>;
}

export const RevenueChart = ({ data }: RevenueChartProps) => {
  return (
    <Card className="rounded-2xl shadow-sm border-none mt-6" title={<span className="font-bold">Diễn Biến Doanh Thu (30 ngày gần nhất)</span>}>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              formatter={(value: any) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
            />
            <Legend verticalAlign="top" align="right" iconType="circle" height={36} />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              name="Doanh thu"
              stroke="#6366f1" 
              strokeWidth={4} 
              dot={{ r: 6, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
