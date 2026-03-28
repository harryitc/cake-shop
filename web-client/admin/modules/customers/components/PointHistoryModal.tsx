"use client";

import React, { useState } from "react";
import { Modal, Table, List, Typography, Tag, Space } from "antd";
import { format } from "date-fns";
import { customersService } from "../services/customers.service";
import { IPointHistoryDTO } from "../types";

const { Text } = Typography;

interface PointHistoryModalProps {
  userId: string;
  userName: string;
  open: boolean;
  onClose: () => void;
}

const PointHistoryModal: React.FC<PointHistoryModalProps> = ({
  userId,
  userName,
  open,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<IPointHistoryDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetchHistory = async (p: number) => {
    setLoading(true);
    try {
      const data = await customersService.getPointHistory(userId, { page: p, limit: 10 });
      setHistory(data.items);
      setTotal(data.total);
      setPage(p);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (open && userId) {
      fetchHistory(1);
    }
  }, [open, userId]);

  return (
    <Modal
      title={`Lịch sử điểm: ${userName}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <List
        loading={loading}
        itemLayout="horizontal"
        dataSource={history}
        pagination={{
          current: page,
          total: total,
          pageSize: 10,
          onChange: (p) => fetchHistory(p),
          size: "small",
          style: { marginTop: 16, textAlign: 'right' }
        }}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              title={
                <Space>
                  <Tag color={item.points_change > 0 ? "success" : "error"}>
                    {item.points_change > 0 ? `+${item.points_change}` : item.points_change}
                  </Tag>
                  <Text strong>{item.reason}</Text>
                </Space>
              }
              description={
                <Space direction="vertical" size={0}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Loại: {item.type}
                  </Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {format(new Date(item.createdAt), "dd/MM/yyyy HH:mm:ss")}
                  </Text>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </Modal>
  );
};

export default PointHistoryModal;
