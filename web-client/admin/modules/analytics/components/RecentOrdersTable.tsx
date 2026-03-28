"use client";

import { Card, Table, Tag, Typography } from "antd";
import dayjs from "dayjs";

const { Text } = Typography;

interface RecentOrdersTableProps {
  data: Array<{
    _id: string;
    total_price: number;
    status: string;
    createdAt: string;
    user_id: {
      full_name: string;
      email: string;
    };
  }>;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "warning",
  CONFIRMED: "processing",
  DONE: "success",
  REJECTED: "error",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ duyệt",
  CONFIRMED: "Đã xác nhận",
  DONE: "Hoàn thành",
  REJECTED: "Đã hủy",
};

export const RecentOrdersTable = ({ data }: RecentOrdersTableProps) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "_id",
      key: "_id",
      render: (id: string) => <Text copyable className="font-mono text-[12px]">{id.slice(-6).toUpperCase()}</Text>,
    },
    {
      title: "Khách hàng",
      dataIndex: "user_id",
      key: "user",
      render: (user: any) => (
        <div>
          <div className="font-bold text-gray-800">{user?.full_name || "N/A"}</div>
          <div className="text-[11px] text-gray-400">{user?.email}</div>
        </div>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "date",
      render: (date: string) => <span className="text-gray-500">{dayjs(date).format("DD/MM/YYYY HH:mm")}</span>,
    },
    {
      title: "Tổng tiền",
      dataIndex: "total_price",
      key: "total",
      align: "right" as const,
      render: (total: number) => <span className="font-bold text-gray-900">{formatCurrency(total)}</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center" as const,
      render: (status: string) => (
        <Tag color={STATUS_COLORS[status] || "default"} className="rounded-full px-3 border-none font-medium">
          {STATUS_LABELS[status] || status}
        </Tag>
      ),
    },
  ];

  return (
    <Card 
      className="rounded-xl border border-gray-100 shadow-sm overflow-hidden" 
      title={<span className="font-bold text-gray-800">Đơn hàng gần đây</span>}
      bodyStyle={{ padding: 0 }}
    >
      <Table 
        dataSource={data} 
        columns={columns} 
        pagination={false} 
        rowKey="_id"
        className="custom-table"
      />
    </Card>
  );
};
