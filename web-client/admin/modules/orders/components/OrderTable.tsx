"use client";

import { Table, Select, message, Skeleton, Tag, Divider } from "antd";
import { useOrdersQuery, useUpdateOrderStatusMutation } from "../hooks";
import { IOrder } from "../types";
import { API_DOMAIN } from "@/lib/configs";
import { useState } from "react";
import { CakeDetailDrawer } from "../../cakes/components/CakeDetailDrawer";


export const OrderTable = () => {
  const [selectedCakeId, setSelectedCakeId] = useState<string | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const { data, isLoading, isError } = useOrdersQuery();
  const { mutate: updateStatus, isPending } = useUpdateOrderStatusMutation();

  const handleShowCakeDetail = (id: string) => {
    setSelectedCakeId(id);
    setDrawerVisible(true);
  };

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
          {Number(record.discountAmount) > 0 && (
            <span className="text-[10px] text-green-500 font-bold">
              Mã giảm: -{new Intl.NumberFormat("vi-VN").format(record.discountAmount!)}đ ({record.couponCode})
            </span>
          )}
          {Number(record.pointsDiscountAmount) > 0 && (
            <span className="text-[10px] text-orange-500 font-bold">
              Dùng điểm: -{new Intl.NumberFormat("vi-VN").format(record.pointsDiscountAmount!)}đ ({record.pointsUsed} pts)
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
              <div className="">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Left Column: Product Details (2/3 width) */}
                  <div className="xl:col-span-2 space-y-3">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                      Chi tiết sản phẩm ({record.itemsCount})
                    </h4>

                    <div className="space-y-2">
                      {record.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100 cursor-pointer hover:border-indigo-400 transition-all group"
                          onClick={() => item.cake_id?._id && handleShowCakeDetail(item.cake_id._id)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 group-hover:shadow-sm transition-all">
                              <img
                                src={item.cake_id?.image_url ? (item.cake_id.image_url.startsWith('http') ? item.cake_id.image_url : `${API_DOMAIN}${item.cake_id.image_url}`) : "https://placehold.co/100x100?text=Cake"}
                                alt={item.cake_id?.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-[13px] group-hover:text-indigo-600 transition-colors leading-tight">{item.cake_id?.name || "Sản phẩm đã xóa"}</div>
                              <div className="flex items-center gap-2 mt-1">
                                {item.variant_size && (
                                  <span className="text-[9px] text-indigo-500 font-black bg-indigo-50 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                    Size: {item.variant_size}
                                  </span>
                                )}
                                <span className="text-slate-400 text-[11px]">
                                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.price_at_buy)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-slate-400 text-[11px] font-bold">x{item.quantity}</div>
                            <div className="font-bold text-indigo-600 text-[13px]">
                              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.price_at_buy * item.quantity)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Info & Summary (1/3 width) */}
                  <div className="space-y-5">
                    {/* Customer Section */}
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                      <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">Khách hàng</h4>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                          {record.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-slate-800 font-bold mb-0 text-[13px]">{record.userName}</p>
                          <p className="text-slate-400 text-[10px] mb-0">{record.userEmail}</p>
                        </div>
                      </div>
                      <div className="space-y-1.5 pt-2 border-t border-slate-50 text-[11px]">
                        <p className="flex justify-between m-0">
                          <span className="text-slate-400">SĐT:</span>
                          <span className="font-bold text-slate-600">{record.userPhone}</span>
                        </p>
                        <p className="flex flex-col gap-0.5 m-0">
                          <span className="text-slate-400">Địa chỉ:</span>
                          <span className="font-medium text-slate-500 line-clamp-2">{record.address}</span>
                        </p>
                      </div>
                    </div>

                    {/* Summary Section */}
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-2.5">
                      <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Thanh toán</h4>
                      <div className="flex justify-between items-center text-[12px]">
                        <span className="text-slate-400">Tạm tính:</span>
                        <span className="font-medium text-slate-600">{new Intl.NumberFormat("vi-VN").format(record.totalPrice)}đ</span>
                      </div>

                      {Number(record.discountAmount) > 0 && (
                        <div className="flex justify-between items-center text-[12px]">
                          <span className="text-emerald-500 font-medium">Mã giảm:</span>
                          <span className="font-bold text-emerald-600">-{new Intl.NumberFormat("vi-VN").format(record.discountAmount!)}đ</span>
                        </div>
                      )}

                      {Number(record.pointsDiscountAmount) > 0 && (
                        <div className="flex justify-between items-center text-[12px]">
                          <span className="text-orange-500 font-medium">Dùng điểm:</span>
                          <span className="font-bold text-orange-600">-{new Intl.NumberFormat("vi-VN").format(record.pointsDiscountAmount!)}đ</span>
                        </div>
                      )}

                      <Divider className="my-1 border-slate-50" />

                      <div className="flex justify-between items-baseline">
                        <span className="text-slate-800 font-black text-[12px]">Tổng cộng:</span>
                        <span className="text-[18px] font-black text-indigo-600">{record.formattedTotal}</span>
                      </div>

                      <div className="mt-2 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100 flex justify-between items-center">
                        <span className="text-[10px] text-indigo-400 uppercase font-black tracking-tight">Tích điểm</span>
                        <span className="text-indigo-600 font-black text-[13px]">+{record.pointsEarned || 0} pts</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          }}
        />
      </div>

      <CakeDetailDrawer
        cakeId={selectedCakeId}
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />
    </div>
  );
};
