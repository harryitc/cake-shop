"use client";

import { Card, Empty } from "antd";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface RevenueChartProps {
  data: Array<{ date: string; revenue: number; orderCount: number }>;
}

export const RevenueChart = ({ data }: RevenueChartProps) => {
  const hasData = data && data.length > 0 && data.some(item => item.revenue > 0);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <Card 
      className="rounded-xl border border-gray-100 shadow-sm" 
      title={<span className="font-bold text-gray-800">Biểu đồ Doanh thu</span>}
      extra={<span className="text-gray-400 text-xs font-medium">30 ngày gần nhất</span>}
    >
      <div className="h-[350px] w-full mt-4">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#533afd" stopOpacity={0.08}/>
                  <stop offset="95%" stopColor="#533afd" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                dy={10}
                tickFormatter={(str) => {
                    const date = new Date(str);
                    return date.getDate() % 5 === 0 ? `${date.getDate()}/${date.getMonth() + 1}` : '';
                }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(value) => `${value >= 1000000 ? (value / 1000000).toFixed(1) + 'M' : (value / 1000).toFixed(0) + 'k'}`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }}
                formatter={(value: any) => [formatCurrency(value), "Doanh thu"]}
                labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: '#1e293b' }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#533afd" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                activeDot={{ r: 6, strokeWidth: 0, fill: '#533afd' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <Empty description={<span className="text-gray-400 font-medium">Chưa có dữ liệu doanh thu</span>} />
          </div>
        )}
      </div>
    </Card>
  );
};
