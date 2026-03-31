"use client";

import React, { useState } from "react";
import { Drawer, Table, Tag, Space, Button, Typography, Pagination, message, Tooltip, Divider } from "antd";
import { HistoryOutlined, FileExcelOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { importApi } from "../../modules/import/api";

const { Text, Title } = Typography;

interface ImportHistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  entityType?: string;
}

const ImportHistoryDrawer: React.FC<ImportHistoryDrawerProps> = ({ open, onClose, entityType }) => {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["import-history", entityType, page],
    queryFn: () => importApi.getHistory(page, pageSize, entityType),
    enabled: open
  });

  const downloadErrors = async (historyId: string) => {
    try {
      const blob = await importApi.downloadErrorReport(historyId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Error_Report_${historyId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      message.error("Đã xảy ra lỗi khi tải báo cáo");
    }
  };

  const columns = [
    {
      title: "Ngày thực hiện",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleString("vi-VN"),
      width: 170
    },
    {
      title: "Chế độ",
      dataIndex: "importMode",
      key: "importMode",
      render: (mode: string) => (
        <Tag color={mode === "UPSERT" ? "blue" : "orange"}>{mode}</Tag>
      ),
      width: 100
    },
    {
      title: (
        <Space size={4}>
          Thống kê
          <Tooltip title="S: Thành công | F: Thất bại | SK: Bỏ qua">
            <InfoCircleOutlined style={{ fontSize: 12, color: "#8c8c8c" }} />
          </Tooltip>
        </Space>
      ),
      key: "stats",
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="Số dòng nhập thành công">
            <Tag color="green">S: {record.stats.success}</Tag>
          </Tooltip>
          <Tooltip title="Số dòng dữ liệu lỗi">
            <Tag color="red">F: {record.stats.failed}</Tag>
          </Tooltip>
          <Tooltip title="Số dòng bị bỏ qua (đã có hoặc không thỏa điều kiện)">
            <Tag color="default">SK: {record.stats.skipped}</Tag>
          </Tooltip>
        </Space>
      )
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colors = { completed: "success", failed: "error", processing: "processing" };
        const icons = { 
          completed: <CheckCircleOutlined />, 
          failed: <CloseCircleOutlined />, 
          processing: <ClockCircleOutlined /> 
        };
        const labels = { completed: "Hoàn tất", failed: "Lỗi hệ thống", processing: "Đang chạy" };
        return <Tag icon={icons[status as keyof typeof icons]} color={colors[status as keyof typeof colors]}>{labels[status as keyof typeof labels]}</Tag>;
      },
      width: 120
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: any) => (
        record.stats.failed > 0 && (
          <Button 
            size="small" 
            type="link" 
            danger 
            icon={<FileExcelOutlined />}
            onClick={() => downloadErrors(record._id)}
          >
            Lỗi
          </Button>
        )
      ),
      width: 80
    }
  ];

  return (
    <Drawer
      title={
        <Space orientation="horizontal">
          <HistoryOutlined />
          <span>Lịch sử Import {entityType === "cakes" ? "Sản phẩm" : ""}</span>
        </Space>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={700}
      mask={{ closable: true }}
    >
      <div style={{ marginBottom: 16 }}>
        <Space separator={<Divider type="vertical" />}>
          <Text type="secondary"><Tag color="green">S</Tag> Thành công</Text>
          <Text type="secondary"><Tag color="red">F</Tag> Thất bại</Text>
          <Text type="secondary"><Tag color="default">SK</Tag> Bỏ qua</Text>
        </Space>
      </div>

      <Table
        dataSource={data?.items || []}
        columns={columns}
        rowKey="_id"
        loading={isLoading}
        pagination={false}
        size="small"
      />
      
      <div style={{ marginTop: 20, textAlign: "right" }}>
        <Pagination
          current={page}
          total={data?.total || 0}
          pageSize={pageSize}
          onChange={(p) => setPage(p)}
          showSizeChanger={false}
          size="small"
        />
      </div>
    </Drawer>
  );
};

export default ImportHistoryDrawer;
