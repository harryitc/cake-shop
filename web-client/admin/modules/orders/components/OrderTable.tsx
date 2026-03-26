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
      key: "user",
      render: (_: any, record: IOrder) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-800">{record.userName}</span>
          <span className="text-[11px] text-gray-400 font-medium">{record.userEmail}</span>
        </div>
      ),
    },
    {
      title: "Địa Chỉ Giao",
      dataIndex: "address",
      key: "address",
      className: "max-w-[200px] truncate text-gray-600",
    },
    {
      title: "Tổng Tiền",
      key: "total",
      render: (_: any, record: IOrder) => (
        <div className="flex flex-col">
          <span className="font-black text-indigo-600 text-[15px]">{record.formattedTotal}</span>
          {record.discountAmount && record.discountAmount > 0 && (
            <span className="text-[10px] text-green-500 font-bold">
               Giảm: {new Intl.NumberFormat("vi-VN").format(record.discountAmount)}đ ({record.couponCode})
            </span>
          )}
        </div>
      ),
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
          expandable={{
            expandedRowRender: (record: IOrder) => (
              <div className="bg-gray-50/50 p-6 rounded-2xl border border-dashed border-gray-200 ml-12 mr-8 mb-4">
                 <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                    <div className="flex-1">
                       <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Thông tin khách hàng</h4>
                       <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                          <div className="flex items-center gap-3 mb-2">
                             <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                {record.userName.charAt(0).toUpperCase()}
                             </div>
                             <div>
                                <p className="text-gray-900 font-bold mb-0 text-[14px]">{record.userName}</p>
                                <p className="text-gray-400 text-[11px] mb-0">{record.userEmail}</p>
                             </div>
                          </div>
                          <div className="pt-2 border-t border-gray-50 space-y-1">
                             <p className="text-gray-600 text-[12px] mb-0 flex items-center gap-2">
                                <span className="text-gray-300">SĐT:</span> <span className="font-medium">{record.userPhone}</span>
                             </p>
                             <p className="text-gray-600 text-[12px] mb-0 flex items-start gap-2">
                                <span className="text-gray-300 whitespace-nowrap">Địa chỉ:</span> <span className="font-medium leading-relaxed">{record.address}</span>
                             </p>
                          </div>
                       </div>
                    </div>
                    <div className="flex-[1.5]">
                       <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 text-right">Chi tiết sản phẩm</h4>
                       <div className="space-y-3">
                          {record.items.map((item, idx) => (
                             <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex items-center gap-4">
                                   <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                                      <img 
                                         src={item.cake_id?.image_url ? (item.cake_id.image_url.startsWith('http') ? item.cake_id.image_url : `http://localhost:5000${item.cake_id.image_url}`) : "https://placehold.co/100x100?text=Cake"} 
                                         alt={item.cake_id?.name} 
                                         className="w-full h-full object-cover"
                                      />
                                   </div>
                                   <div>
                                      <div className="font-bold text-gray-800 text-[13px]">{item.cake_id?.name || "Sản phẩm đã xóa"}</div>
                                      <div className="text-[11px] text-gray-400">Đơn giá: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.price_at_buy)}</div>
                                   </div>
                                </div>
                                <div className="text-right">
                                   <div className="text-[11px] text-gray-400 font-medium">x{item.quantity}</div>
                                   <div className="font-bold text-indigo-600 text-[13px]">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.price_at_buy * item.quantity)}</div>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
                 <div className="mt-4 flex justify-end pt-3 border-t border-gray-100">
                    <div className="text-right">
                       <div className="text-[11px] text-gray-400">Tạm tính: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(record.totalPrice)}</div>
                       {record.discountAmount && record.discountAmount > 0 ? (
                          <div className="text-[11px] text-green-500 font-bold">Giảm giá ({record.couponCode}): -{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(record.discountAmount)}</div>
                       ) : null}
                       <div className="text-[18px] font-black text-indigo-600 mt-1">Tổng cộng: {record.formattedTotal}</div>
                    </div>
                 </div>
              </div>
            ),
          }}
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
