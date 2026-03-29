"use client";

import React, { useState } from "react";
import { Table, Space, Button, Tag, Input, Select, Card, Typography, Tooltip, Avatar } from "antd";
import type { ColumnsType } from "antd/es/table";
import { 
  SearchOutlined, 
  EyeOutlined,
  LockOutlined, 
  UserOutlined,
  PhoneOutlined,
  ShoppingOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";
import { useCustomersQuery } from "../hooks";
import LoyaltyStats from "./LoyaltyStats";
import CustomerDetailModal from "./CustomerDetailModal";
import { getAvatarUrl } from "@/lib/utils";
import { CustomerModel } from "../mapper";

const { Title, Text } = Typography;
const { Option } = Select;

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price || 0);

const CustomerTable: React.FC = () => {
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    search: "",
    rank: "",
  });

  const { data, isLoading } = useCustomersQuery(params.page, params.limit, params.search);
  const customers = data?.items || [];
  const total = data?.total || 0;

  const [selectedUser, setSelectedUser] = useState<CustomerModel | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const handleSearch = (value: string) => {
    setParams((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleRankFilter = (value: string) => {
    setParams((prev) => ({ ...prev, rank: value, page: 1 }));
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case "BRONZE": return "#cd7f32";
      case "SILVER": return "#8c8c8c";
      case "GOLD": return "#d4b106";
      case "DIAMOND": return "#722ed1";
      default: return "#1890ff";
    }
  };

  const columns: ColumnsType<CustomerModel> = [
    {
      title: "Khách hàng",
      key: "customer",
      fixed: 'left',
      width: 220,
      render: (_, record) => (
        <Space>
          <Avatar src={getAvatarUrl(record.avatar)} icon={<UserOutlined />} className="border border-gray-100" />
          <Space direction="vertical" size={0}>
            <Text strong className="block leading-tight">{record.name}</Text>
            <Text type="secondary" style={{ fontSize: "12px" }}>{record.email}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "SĐT",
      dataIndex: "phone",
      key: "phone",
      width: 140,
      render: (phone) => phone ? (
        <Space size={4}>
          <PhoneOutlined className="text-gray-400 text-[10px]" />
          <Text style={{ fontSize: '13px' }}>{phone}</Text>
        </Space>
      ) : <Text type="secondary" italic style={{ fontSize: '12px' }}>--</Text>,
    },
    {
      title: "Thành viên",
      key: "rank_points",
      width: 160,
      render: (_, record) => (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <Tag color={getRankColor(record.rank)} style={{ margin: 0, fontWeight: '800', fontSize: '10px', borderRadius: '4px' }}>
              {record.rank}
            </Tag>
            {record.rank_lock && (
              <Tooltip title="Hạng đã được quản trị viên khóa cố định">
                <LockOutlined style={{ color: "#faad14", fontSize: '11px' }} />
              </Tooltip>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Text className="text-[12px] font-bold text-indigo-600">
              {(record.loyalty_points || 0).toLocaleString()}
            </Text>
            <Text type="secondary" className="text-[10px] uppercase font-bold tracking-tighter">pts</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Giao dịch",
      key: "transactions",
      align: 'right',
      width: 180,
      render: (_, record: any) => (
        <div className="flex flex-col gap-0.5 text-right">
          <Text strong className="text-green-600 text-[14px]">
            {formatPrice(record.total_spent || 0)}
          </Text>
          <div className="flex items-center justify-end gap-1.5">
            <Text type="secondary" className="text-[12px]">
              <ShoppingOutlined className="mr-1" />
              {record.total_orders || 0} đơn hàng
            </Text>
            <Tooltip title="Tổng số lượng đơn hàng khách đã đặt từ trước đến nay (bao gồm tất cả trạng thái).">
              <InfoCircleOutlined className="text-gray-300 text-[10px] cursor-help" />
            </Tooltip>
          </div>
        </div>
      ),
      sorter: (a: any, b: any) => (a.total_spent || 0) - (b.total_spent || 0),
    },
    {
      title: "",
      key: "action",
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Button
          type="primary"
          ghost
          icon={<EyeOutlined />}
          size="small"
          className="rounded-md font-medium text-[12px]"
          onClick={() => {
            setSelectedUser(record);
            setDetailModalOpen(true);
          }}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <Space direction="vertical" style={{ width: "100%" }} size="middle">
      <LoyaltyStats />
      
      <Card bordered={false} className="shadow-sm border border-gray-100">
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <Title level={4} style={{ margin: 0 }}>Danh sách khách hàng</Title>
            <div className="flex flex-wrap gap-3">
              <Input
                placeholder="Tìm tên, email, SĐT..."
                prefix={<SearchOutlined className="text-gray-400" />}
                onPressEnter={(e) => handleSearch(e.currentTarget.value)}
                style={{ width: 220 }}
                className="rounded-lg"
                allowClear
              />
              <Select
                placeholder="Lọc hạng"
                allowClear
                style={{ width: 130 }}
                onChange={handleRankFilter}
                className="rounded-lg"
              >
                <Option value="BRONZE">Đồng (Bronze)</Option>
                <Option value="SILVER">Bạc (Silver)</Option>
                <Option value="GOLD">Vàng (Gold)</Option>
                <Option value="DIAMOND">Kim cương (Diamond)</Option>
              </Select>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={customers}
            rowKey="id"
            loading={isLoading}
            scroll={{ x: 800 }}
            className="customer-table"
            pagination={{
              current: params.page,
              pageSize: params.limit,
              total: total,
              showSizeChanger: true,
              showTotal: (total) => `Tổng cộng ${total} khách hàng`,
              onChange: (page, pageSize) => {
                setParams((prev) => ({ ...prev, page, limit: pageSize }));
              },
            }}
          />
        </Space>
      </Card>

      <CustomerDetailModal
        customer={selectedUser}
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
      />
    </Space>
  );
};

export default CustomerTable;
