"use client";

import React, { useState, useEffect } from "react";
import { 
  Modal, 
  Tabs, 
  Descriptions, 
  Avatar, 
  Tag, 
  Table, 
  Typography, 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Progress, 
  Button, 
  Space,
  message
} from "antd";
import { 
  UserOutlined, 
  EnvironmentOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  CalendarOutlined,
  HistoryOutlined,
  EditOutlined,
  SettingOutlined,
  ShoppingOutlined,
  TrophyOutlined,
  StarOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";
import { ICustomerDTO, IPointHistoryDTO, ILoyaltyConfig } from "../types";
import { customersService } from "../api";
import { orderApi } from "../../orders/api";
import { IOrderDTO } from "../../orders/types";
import AdjustPointsModal from "./AdjustPointsModal";
import OverrideRankModal from "./OverrideRankModal";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { getAvatarUrl } from "@/lib/utils";

const { Title, Text } = Typography;

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

interface CustomerDetailModalProps {
  customer: ICustomerDTO | null;
  open: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  open,
  onClose,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [orders, setOrders] = useState<IOrderDTO[]>([]);
  const [pointHistory, setPointHistory] = useState<IPointHistoryDTO[]>([]);
  const [loyaltyConfig, setLoyaltyConfig] = useState<ILoyaltyConfig | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingPoints, setLoadingPoints] = useState(false);
  
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);

  useEffect(() => {
    if (open && customer) {
      fetchLoyaltyConfig();
      if (activeTab === "orders") fetchOrders();
      if (activeTab === "points") fetchPoints();
    }
  }, [open, customer, activeTab]);

  const fetchLoyaltyConfig = async () => {
    try {
      const config = await customersService.getLoyaltyConfig();
      setLoyaltyConfig(config);
    } catch (error) {
      console.error("Failed to fetch loyalty config:", error);
    }
  };

  const fetchOrders = async () => {
    if (!customer) return;
    setLoadingOrders(true);
    try {
      const result = await orderApi.getAll({ userId: customer._id });
      setOrders(result.items);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchPoints = async () => {
    if (!customer) return;
    setLoadingPoints(true);
    try {
      const result = await customersService.getPointHistory(customer._id);
      setPointHistory(result.items);
    } catch (error) {
      console.error("Failed to fetch point history:", error);
    } finally {
      setLoadingPoints(false);
    }
  };

  if (!customer) return null;

  const getRankColor = (rank: string) => {
    switch (rank) {
      case "BRONZE": return "orange";
      case "SILVER": return "default";
      case "GOLD": return "gold";
      case "PLATINUM": return "cyan";
      case "DIAMOND": return "purple";
      default: return "blue";
    }
  };

  const getNextRankInfo = () => {
    if (!loyaltyConfig || !customer) return null;
    const ranks = ["BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND"];
    const currentIndex = ranks.indexOf(customer.rank);
    if (currentIndex === -1 || currentIndex === ranks.length - 1) return null;

    const nextRank = ranks[currentIndex + 1];
    const threshold = loyaltyConfig.tier_thresholds[nextRank];
    if (!threshold) return null;

    const progress = Math.min(100, Math.floor((customer.total_spent / threshold) * 100));
    
    return {
      nextRank,
      threshold,
      progress,
      remaining: Math.max(0, threshold - customer.total_spent)
    };
  };

  const nextRankInfo = getNextRankInfo();

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <Modal
      title={
        <Space>
          <UserOutlined />
          <span>Chi tiết khách hàng: {customer.full_name || customer.email}</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width="100%"
      centered
      styles={{
        body: { padding: 0, height: "calc(100vh - 110px)", overflow: "hidden" },
        mask: { backdropFilter: "blur(4px)" }
      }}
      style={{ top: 0, padding: 0, maxWidth: "none" }}
    >
      <div style={{ display: "flex", height: "100%" }}>
        {/* Sidebar Column */}
        <div style={{ 
          width: "300px", 
          borderRight: "1px solid #f0f0f0", 
          padding: "24px", 
          overflowY: "auto",
          backgroundColor: "#fafafa"
        }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <Avatar 
              size={120} 
              src={getAvatarUrl(customer.avatar_url)} 
              icon={<UserOutlined />} 
              style={{ border: "4px solid #fff", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
            />
            <Title level={4} style={{ marginTop: 16, marginBottom: 8 }}>
              {customer.full_name || "N/A"}
            </Title>
            <Tag color={getRankColor(customer.rank)} style={{ fontSize: "14px", padding: "4px 12px", borderRadius: "12px" }}>
              {customer.rank}
            </Tag>
          </div>
          
          <Descriptions column={1} size="small" layout="vertical" labelStyle={{ color: "#8c8c8c" }}>
            <Descriptions.Item label={<Space><MailOutlined /> Email</Space>}>
              <Text copyable>{customer.email}</Text>
            </Descriptions.Item>
            <Descriptions.Item label={<Space><PhoneOutlined /> Số điện thoại</Space>}>
              {customer.phone || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label={<Space><EnvironmentOutlined /> Địa chỉ</Space>}>
              {customer.address || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label={<Space><CalendarOutlined /> Ngày tham gia</Space>}>
              {formatDate(customer.createdAt)}
            </Descriptions.Item>
          </Descriptions>
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            type="card"
            items={[
              {
                key: "overview",
                label: <Space><InfoCircleOutlined /> Tổng quan</Space>,
                children: (
                  <Space direction="vertical" size="large" style={{ width: "100%" }}>
                    <Row gutter={[16, 16]}>
                      <Col span={8}>
                        <Card bordered={false} style={{ backgroundColor: "#fff1f0" }}>
                          <Statistic 
                            title="Tổng chi tiêu" 
                            value={customer.total_spent} 
                            suffix="đ" 
                            valueStyle={{ color: "#cf1322" }}
                          />
                        </Card>
                      </Col>
                      <Col span={8}>
                        <Card bordered={false} style={{ backgroundColor: "#e6f7ff" }}>
                          <Statistic 
                            title="Điểm tích lũy" 
                            value={customer.loyalty_points} 
                            prefix={<StarOutlined style={{ color: "#1890ff" }} />}
                          />
                        </Card>
                      </Col>
                      <Col span={8}>
                        <Card bordered={false} style={{ backgroundColor: "#f9f0ff" }}>
                          <Statistic 
                            title="Đơn hàng" 
                            value={orders.length} 
                            prefix={<ShoppingOutlined style={{ color: "#722ed1" }} />}
                          />
                        </Card>
                      </Col>
                    </Row>

                    {nextRankInfo && (
                      <Card title={<Space><TrophyOutlined /> Tiến trình hạng</Space>} size="small">
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                          <Text strong>Hạng tiếp theo: {nextRankInfo.nextRank}</Text>
                          <Text type="secondary">
                            Còn thiếu {nextRankInfo.remaining.toLocaleString()}đ để nâng hạng
                          </Text>
                        </div>
                        <Progress 
                          percent={nextRankInfo.progress} 
                          status="active" 
                          strokeColor={{
                            "0%": "#108ee9",
                            "100%": "#87d068",
                          }}
                          strokeWidth={12}
                        />
                      </Card>
                    )}
                  </Space>
                )
              },
              {
                key: "loyalty",
                label: <Space><StarOutlined /> Loyalty</Space>,
                children: (
                  <Card title="Chi tiết Loyalty" size="small">
                    <Descriptions bordered column={2}>
                      <Descriptions.Item label="Hạng hiện tại">
                        <Tag color={getRankColor(customer.rank)}>{customer.rank}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Trạng thái khóa hạng">
                        {customer.rank_lock ? <Tag color="warning">Đã khóa</Tag> : <Tag color="success">Tự động</Tag>}
                      </Descriptions.Item>
                      <Descriptions.Item label="Tổng tích lũy">
                        {customer.total_spent.toLocaleString()}đ
                      </Descriptions.Item>
                      <Descriptions.Item label="Điểm hiện có">
                        {customer.loyalty_points} điểm
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                )
              },
              {
                key: "orders",
                label: <Space><ShoppingOutlined /> Đơn hàng</Space>,
                children: (
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <Row gutter={16}>
                      <Col span={6}>
                        <Card size="small" bodyStyle={{ padding: '12px' }} className="border-gray-100 bg-blue-50">
                          <Statistic 
                            title={<span className="text-[11px] font-bold uppercase text-blue-500">Tất cả</span>} 
                            value={orders.length} 
                            valueStyle={{ fontSize: '18px', fontWeight: '800' }}
                          />
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card size="small" bodyStyle={{ padding: '12px' }} className="border-gray-100 bg-green-50">
                          <Statistic 
                            title={<span className="text-[11px] font-bold uppercase text-green-600">Thành công</span>} 
                            value={orders.filter(o => o.status === 'DONE').length} 
                            suffix={<span className="text-[10px] text-green-500 font-normal">đơn</span>}
                            valueStyle={{ fontSize: '18px', fontWeight: '800', color: '#52c41a' }}
                          />
                          <div className="mt-1 pt-1 border-t border-green-100">
                            <Text className="text-[11px] text-green-600 font-bold">
                              {formatPrice(orders.filter(o => o.status === 'DONE').reduce((sum, o) => sum + (o.final_price || 0), 0))}
                            </Text>
                          </div>
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card size="small" bodyStyle={{ padding: '12px' }} className="border-gray-100 bg-orange-50">
                          <Statistic 
                            title={<span className="text-[11px] font-bold uppercase text-orange-500">Đang xử lý</span>} 
                            value={orders.filter(o => ['PENDING', 'CONFIRMED'].includes(o.status)).length} 
                            suffix={<span className="text-[10px] text-orange-400 font-normal">đơn</span>}
                            valueStyle={{ fontSize: '18px', fontWeight: '800', color: '#faad14' }}
                          />
                          <div className="mt-1 pt-1 border-t border-orange-100">
                            <Text className="text-[11px] text-orange-600 font-bold">
                              {formatPrice(orders.filter(o => ['PENDING', 'CONFIRMED'].includes(o.status)).reduce((sum, o) => sum + (o.final_price || 0), 0))}
                            </Text>
                          </div>
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card size="small" bodyStyle={{ padding: '12px' }} className="border-gray-100 bg-red-50">
                          <Statistic 
                            title={<span className="text-[11px] font-bold uppercase text-red-500">Đã hủy</span>} 
                            value={orders.filter(o => o.status === 'REJECTED').length} 
                            valueStyle={{ fontSize: '18px', fontWeight: '800', color: '#f5222d' }}
                          />
                        </Card>
                      </Col>
                    </Row>

                    <Table
                      dataSource={orders}
                      loading={loadingOrders}
                      rowKey="_id"
                      size="small"
                      columns={[
                        { 
                          title: "Mã đơn", 
                          dataIndex: "_id", 
                          render: (id) => <Text copyable={{ text: id }}>#{id.slice(-6).toUpperCase()}</Text> 
                        },
                        { 
                          title: "Ngày đặt", 
                          dataIndex: "createdAt", 
                          render: (date) => formatDate(date) 
                        },
                        { 
                          title: "Tổng tiền", 
                          dataIndex: "final_price", 
                          render: (price) => <Text strong>{price?.toLocaleString()}đ</Text> 
                        },
                        { 
                          title: "Trạng thái", 
                          dataIndex: "status", 
                          render: (status) => {
                            let color = 'blue';
                            if (status === 'DONE') color = 'green';
                            if (status === 'REJECTED') color = 'red';
                            if (status === 'CONFIRMED') color = 'orange';
                            return <Tag color={color}>{status}</Tag>;
                          } 
                        },
                      ]}
                      pagination={{ pageSize: 10 }}
                    />
                  </Space>
                )
              },
              {
                key: "points",
                label: <Space><HistoryOutlined /> Lịch sử điểm</Space>,
                children: (
                  <Table
                    dataSource={pointHistory}
                    loading={loadingPoints}
                    rowKey="_id"
                    size="small"
                    columns={[
                      { 
                        title: "Ngày", 
                        dataIndex: "createdAt", 
                        render: (date) => formatDate(date) 
                      },
                      { 
                        title: "Thay đổi", 
                        dataIndex: "points_change", 
                        render: (points) => (
                          <Text strong type={points > 0 ? "success" : "danger"}>
                            {points > 0 ? `+${points}` : points}
                          </Text>
                        ) 
                      },
                      { title: "Loại", dataIndex: "type", render: (type) => <Tag>{type}</Tag> },
                      { title: "Lý do", dataIndex: "reason" },
                    ]}
                    pagination={{ pageSize: 10 }}
                  />
                )
              },
              {
                key: "actions",
                label: <Space><SettingOutlined /> Thao tác</Space>,
                children: (
                  <div style={{ padding: "40px 0", textAlign: "center" }}>
                    <Card bordered={false} style={{ maxWidth: 500, margin: "0 auto" }}>
                      <Title level={5} style={{ marginBottom: 24 }}>Quản lý tài khoản khách hàng</Title>
                      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                        <Button 
                          type="primary" 
                          icon={<EditOutlined />} 
                          block 
                          size="large"
                          onClick={() => setAdjustModalOpen(true)}
                        >
                          Điều chỉnh điểm tích lũy
                        </Button>
                        <Button 
                          icon={<SettingOutlined />} 
                          block 
                          size="large"
                          onClick={() => setOverrideModalOpen(true)}
                        >
                          Thiết lập hạng & Khóa hạng
                        </Button>
                      </Space>
                    </Card>
                  </div>
                )
              }
            ]}
          />
        </div>
      </div>

      {/* Sub-modals */}
      <AdjustPointsModal
        userId={customer._id}
        userName={customer.full_name || customer.email}
        open={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        onSuccess={() => {
          onRefresh?.();
          fetchPoints();
          message.success("Cập nhật điểm thành công");
        }}
      />
      <OverrideRankModal
        userId={customer._id}
        userName={customer.full_name || customer.email}
        currentRank={customer.rank}
        currentLock={customer.rank_lock}
        open={overrideModalOpen}
        onClose={() => setOverrideModalOpen(false)}
        onSuccess={() => {
          onRefresh?.();
          message.success("Cập nhật hạng thành công");
        }}
      />
    </Modal>
  );
};

export default CustomerDetailModal;
