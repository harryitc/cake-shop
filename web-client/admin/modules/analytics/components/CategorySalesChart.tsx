"use client";

import { Card, Empty } from "antd";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface CategorySalesChartProps {
  data: Array<{ name: string; value: number }>;
}

const COLORS = ['#533afd', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#f59e0b'];

export const CategorySalesChart = ({ data }: CategorySalesChartProps) => {
  const hasData = data && data.length > 0;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <Card 
      className="rounded-xl border border-gray-100 shadow-sm h-full" 
      title={<span className="font-bold text-gray-800">Doanh thu theo danh mục</span>}
    >
      <div className="h-[300px] w-full mt-2">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
                width={80}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                formatter={(value: any) => [formatCurrency(value), "Doanh thu"]}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <Empty description={<span className="text-gray-400 font-medium">Chưa có dữ liệu danh mục</span>} />
          </div>
        )}
      </div>
    </Card>
  );
};
