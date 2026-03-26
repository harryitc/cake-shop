"use client";

import { Card, Empty } from "antd";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from "recharts";

interface RevenueChartProps {
  data: Array<{ date: string; revenue: number; orderCount: number }>;
}

export const RevenueChart = ({ data }: RevenueChartProps) => {
  const hasData = data && data.length > 0 && data.some(item => item.revenue > 0);

  return (
    <Card 
      className="rounded-3xl shadow-sm border border-gray-100 mt-6" 
      title={<span className="font-extrabold text-gray-800">Diễn Biến Doanh Thu</span>}
      extra={<span className="text-gray-400 text-xs font-medium italic">30 ngày gần nhất</span>}
    >
      <div className="h-[400px] w-full flex items-center justify-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                dy={15}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                tickFormatter={(value) => `${value >= 1000000 ? (value / 1000000).toFixed(1) + 'M' : (value / 1000).toFixed(0) + 'k'}`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', padding: '12px' }}
                formatter={(value: any) => [new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value), "Doanh thu"]}
                labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: '#1e293b' }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#6366f1" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                activeDot={{ r: 8, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <Empty description={<span className="text-gray-400 font-medium">Chưa có dữ liệu doanh thu hoàn thành</span>} />
        )}
      </div>
    </Card>
  );
};

