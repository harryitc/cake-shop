"use client";

import React from "react";
import { Card, Row, Col, Statistic, Spin, Tooltip } from "antd";
import { 
  TeamOutlined, 
  StarFilled, 
  CrownOutlined, 
  RocketOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";
import { useLoyaltyStatsQuery } from "../hooks";

const LoyaltyStats: React.FC = () => {
  const { data: stats, isLoading } = useLoyaltyStatsQuery();

  if (isLoading) {
    return <div style={{ textAlign: "center", padding: "20px" }}><Spin /></div>;
  }

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
      <Col xs={24} sm={12} md={6}>
        <Card bordered={false} className="shadow-sm">
          <Statistic
            title={
              <div className="flex items-center gap-1">
                <span className="text-gray-500 font-medium">Tổng khách hàng</span>
                <Tooltip title="Tổng số người dùng có vai trò là khách hàng đã đăng ký tài khoản.">
                  <InfoCircleOutlined className="text-gray-400 text-xs cursor-help" />
                </Tooltip>
              </div>
            }
            value={stats?.totalUsers || 0}
            prefix={<TeamOutlined style={{ color: "#1890ff", marginRight: "8px" }} />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card bordered={false} className="shadow-sm">
          <Statistic
            title={
              <div className="flex items-center gap-1">
                <span className="text-gray-500 font-medium">Điểm đã cấp</span>
                <Tooltip title="Tổng số điểm tích lũy hiện có trong ví của tất cả khách hàng.">
                  <InfoCircleOutlined className="text-gray-400 text-xs cursor-help" />
                </Tooltip>
              </div>
            }
            value={stats?.totalPointsIssued || 0}
            prefix={<StarFilled style={{ color: "#faad14", marginRight: "8px" }} />}
            suffix={<span className="text-xs text-gray-400 ml-1">pts</span>}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card bordered={false} className="shadow-sm">
          <Statistic
            title={
              <div className="flex items-center gap-1">
                <span className="text-gray-500 font-medium">Khách hàng VIP</span>
                <Tooltip title="Số lượng khách hàng đang ở hạng Vàng (Gold) hoặc Kim cương (Diamond).">
                  <InfoCircleOutlined className="text-gray-400 text-xs cursor-help" />
                </Tooltip>
              </div>
            }
            value={stats?.vipCount || 0}
            prefix={<CrownOutlined style={{ color: "#722ed1", marginRight: "8px" }} />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card bordered={false} className="shadow-sm">
          <Statistic
            title={
              <div className="flex items-center gap-1">
                <span className="text-gray-500 font-medium">Sắp lên hạng</span>
                <Tooltip title="Số khách hàng đã đạt trên 80% chi tiêu để lên hạng thành viên tiếp theo.">
                  <InfoCircleOutlined className="text-gray-400 text-xs cursor-help" />
                </Tooltip>
              </div>
            }
            value={stats?.nearUpgradeCount || 0}
            prefix={<RocketOutlined style={{ color: "#52c41a", marginRight: "8px" }} />}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default LoyaltyStats;
