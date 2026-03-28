"use client";

import React from "react";
import { Typography, Breadcrumb, Space } from "antd";
import { HomeOutlined, UserOutlined, SettingOutlined } from "@ant-design/icons";
import LoyaltyConfigForm from "@/modules/customers/components/LoyaltyConfigForm";

const { Title } = Typography;

const LoyaltyConfigPage: React.FC = () => {
  return (
    <Space direction="vertical" style={{ width: "100%" }} size="large">
      <Breadcrumb
        items={[
          { title: <HomeOutlined />, href: "/admin" },
          { title: <><UserOutlined /><span>Quản lý khách hàng</span></> },
          { title: "Cấu hình Loyalty" },
        ]}
      />
      
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <SettingOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
        <Title level={2} style={{ margin: 0 }}>Cấu hình Loyalty</Title>
      </div>

      <LoyaltyConfigForm />
    </Space>
  );
};

export default LoyaltyConfigPage;
