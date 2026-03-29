"use client";

import React, { useState } from "react";
import { Modal, Table, Typography, Tag, Empty } from "antd";
import { format } from "date-fns";
import { customersService } from "../api";
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
      <Table
        loading={loading}
        dataSource={history}
        rowKey="_id"
        showHeader={false}
        pagination={{
          current: page,
          total: total,
          pageSize: 10,
          onChange: (p) => fetchHistory(p),
          size: "small",
          style: { marginTop: 16, textAlign: 'right' }
        }}
        locale={{
          emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có lịch sử điểm" />
        }}
        columns={[
          {
            title: 'Lịch sử',
            key: 'history',
            render: (_, item: any) => (
              <div style={{ padding: '4px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Tag color={item.points_change > 0 ? "success" : "error"} style={{ minWidth: '45px', textAlign: 'center' }}>
                    {item.points_change > 0 ? `+${item.points_change}` : item.points_change}
                  </Tag>
                  <Text strong>{item.reason}</Text>
                </div>
                <div style={{ marginTop: 6, paddingLeft: '53px' }}>
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                    Loại: {item.type}
                  </Text>
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                    {format(new Date(item.createdAt), "dd/MM/yyyy HH:mm:ss")}
                  </Text>
                </div>
              </div>
            )
          }
        ]}
      />
    </Modal>
  );
};

export default PointHistoryModal;
