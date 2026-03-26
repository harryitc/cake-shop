"use client";

import { Table, Select, message, Skeleton } from "antd";
import { useOrdersQuery, useUpdateOrderStatusMutation } from "../hooks";
import { IOrder } from "../types";

export const OrderTable = () => {
  const { data, isLoading, isError } = useOrdersQuery();
  const { mutate: updateStatus, isPending } = useUpdateOrderStatusMutation();

  const handleStatusChange = (id: string, value: string) => {
    updateStatus({ id, payload: { status: value } }, {
      onSuccess: () => message.success("Đã ghi nhận thay đổi trạng thái"),
      onError: (err) => message.error(err.message || "Lỗi cập nhật hệ thống"),
    });
  };

  const VALID_TRANSITIONS = {
    PENDING: ["CONFIRMED", "REJECTED"],
    CONFIRMED: ["DONE"],
    DONE: [],
    REJECTED: [],
  };

  const getStatusOptions = (currentStatus: string) => {
    const validNext = (VALID_TRANSITIONS as any)[currentStatus] || [];
    const allStatuses = ["PENDING", "CONFIRMED", "DONE", "REJECTED"];
    return allStatuses.map(status => ({
      value: status,
      label: status,
      disabled: currentStatus !== status && !validNext.includes(status),
    }));
  };

  if (isLoading) return <div className="p-8 bg-white mt-4 rounded-[24px] border border-gray-100"><Skeleton active paragraph={{ rows: 10 }} /></div>;
  if (isError) return <div className="p-8 text-center text-red-500 font-bold bg-white rounded-3xl shadow-sm">Lỗi tải danh sách hóa đơn!</div>;

  const columns = [
    {
      title: "Mã Đơn",
      dataIndex: "id",
      key: "id",
      render: (val: string) => <span className="font-mono text-gray-500">...{val.slice(-6).toUpperCase()}</span>,
    },
    {
      title: "Khách Hàng",
      dataIndex: "userEmail",
      key: "user",
      className: "font-medium text-gray-800",
    },
    {
      title: "Địa Chỉ Giao",
      dataIndex: "address",
      key: "address",
      className: "max-w-[200px] truncate text-gray-600",
    },
    {
      title: "Tổng Tiền",
      dataIndex: "formattedTotal",
      key: "total",
      className: "font-black text-indigo-600 text-[15px]",
    },
    {
      title: "Lúc Đặt",
      dataIndex: "formattedDate",
      key: "createdAt",
      className: "text-gray-500 whitespace-nowrap",
    },
    {
      title: "Trạng Thái",
      key: "status",
      render: (_: any, record: IOrder) => (
        <Select
          value={record.status}
          onChange={(val) => handleStatusChange(record.id, val)}
          disabled={record.status === "DONE" || record.status === "REJECTED" || isPending}
          options={getStatusOptions(record.status)}
          className="w-40 font-bold shadow-sm"
          loading={isPending}
        />
      ),
      width: 180
    },
  ];

  return (
    <div className="bg-white rounded-[24px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-gray-100 p-8">
      <div className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Quản Lý Đơn Hàng</h1>
          <p className="text-gray-400 font-medium mt-1">Lịch sử đơn hàng toàn hệ thống.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table 
          dataSource={data?.items || []} 
          columns={columns} 
          rowKey="id" 
          pagination={{ pageSize: 15 }}
          className="custom-admin-table"
        />
      </div>
      <style jsx global>{`
        .custom-admin-table .ant-table-thead > tr > th {
          background-color: #fafafa;
          color: #999;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #f0f0f0;
        }
      `}</style>
    </div>
  );
};
