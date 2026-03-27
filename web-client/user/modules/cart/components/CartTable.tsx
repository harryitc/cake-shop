"use client";

import { Table, Button, Skeleton, Empty, Popconfirm, App, InputNumber } from "antd";
import { DeleteOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { useCartQuery, useRemoveCartItemMutation, useUpdateCartItemQuantityMutation } from "../hooks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { CheckoutModal } from "../../orders/components/CheckoutModal";

import { API_DOMAIN } from "@/lib/configs";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const QuantityControl = ({
  value,
  max,
  onUpdate
}: {
  value: number;
  max: number;
  onUpdate: (num: number) => void
}) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: number | null) => {
    if (newValue === null) return;
    setLocalValue(newValue);
  };

  const syncUpdate = (v: number) => {
    if (v >= 1 && v <= max) {
      if (v !== value) onUpdate(v);
    } else {
      setLocalValue(value);
    }
  };

  return (
    <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 w-fit border border-gray-100 shadow-sm">
      <Button
        type="text"
        size="small"
        className="flex items-center justify-center hover:!bg-white hover:!text-indigo-600 transition-all rounded-md h-8 w-8"
        icon={<MinusOutlined className="text-[12px]" />}
        onClick={() => {
          if (localValue > 1) {
            const next = localValue - 1;
            setLocalValue(next);
            onUpdate(next);
          }
        }}
        disabled={localValue <= 1}
      />
      <InputNumber
        min={1}
        max={max}
        value={localValue}
        controls={false}
        variant="borderless"
        className="w-10 text-center font-bold text-gray-700"
        onChange={handleChange}
        onBlur={() => syncUpdate(localValue)}
        onPressEnter={() => syncUpdate(localValue)}
      />
      <Button
        type="text"
        size="small"
        className="flex items-center justify-center hover:!bg-white hover:!text-indigo-600 transition-all rounded-md h-8 w-8"
        icon={<PlusOutlined className="text-[12px]" />}
        onClick={() => {
          if (localValue < max) {
            const next = localValue + 1;
            setLocalValue(next);
            onUpdate(next);
          }
        }}
        disabled={localValue >= max}
      />
    </div>
  );
};

export const CartTable = () => {
  const { message } = App.useApp();
  const router = useRouter();
  const { data: rawCart, isLoading, isError } = useCartQuery();
  const { mutate: removeItem, isPending } = useRemoveCartItemMutation();
  const { mutate: updateQuantity } = useUpdateCartItemQuantityMutation();
  const [modalOpen, setModalOpen] = useState(false);

  if (isLoading) return <div className="p-8"><Skeleton active paragraph={{ rows: 6 }} /></div>;
  if (isError) return <div className="p-8 text-center text-red-500">Lỗi không thể tải giỏ hàng</div>;

  const cartLocal: any = rawCart || { items: [], total: 0 };

  if (cartLocal.items.length === 0) {
    return (
      <div className="py-20 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
        <Empty description={<span className="text-gray-500 text-lg">Giỏ hàng của bạn đang trống</span>} />
        <Button type="primary" size="large" className="mt-6 bg-indigo-600 font-semibold" onClick={() => router.push("/cakes")}>
          Quay lại mua sắm
        </Button>
      </div>
    );
  }

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "cake",
      key: "cake",
      render: (cake: any, record: any) => (
        <div className="flex items-center gap-4">
          <img src={cake.image_url ? (cake.image_url.startsWith('http') ? cake.image_url : `${API_DOMAIN}${cake.image_url}`) : "https://placehold.co/100x100"} alt={cake.name} className="w-16 h-16 rounded object-cover border" />
          <div className="flex flex-col">
            <Link href={`/cakes/${cake._id}`} className="font-semibold text-gray-800 hover:text-indigo-600 min-w-[150px]">
              {cake.name}
            </Link>
            {record.variant && (
              <span className="text-xs text-indigo-500 font-bold bg-indigo-50 px-2 py-0.5 rounded w-fit mt-1">
                Size: {record.variant.size}
              </span>
            )}
            {record.variant_size && !record.variant && (
               <span className="text-xs text-indigo-500 font-bold bg-indigo-50 px-2 py-0.5 rounded w-fit mt-1">
                Size: {record.variant_size}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Đơn giá",
      key: "price",
      render: (_: any, record: any) => formatPrice(record.price || record.cake.price)
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (val: number, record: any) => (
        <QuantityControl
          value={val}
          max={record.variant?.stock ?? record.cake?.stock ?? 99}
          onUpdate={(quantity) => {
            updateQuantity({ id: record.id, quantity }, {
              onError: () => message.error("Lỗi cập nhật số lượng"),
            });
          }}
        />
      )
    },
    {
      title: "Thành tiền",
      dataIndex: "subtotal",
      key: "subtotal",
      render: (val: number) => <span className="font-semibold text-indigo-600">{formatPrice(val)}</span>
    },
    {
      title: "",
      key: "action",
      render: (_: any, record: any) => (
        <Popconfirm
          title="Xóa khỏi giỏ hàng?"
          description={`Bạn có chắc muốn xóa bánh này?`}
          onConfirm={() => {
            removeItem(record.id, {
              onSuccess: () => message.success("Đã xóa"),
              onError: () => message.error("Lỗi xóa sản phẩm"),
            });
          }}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button danger type="text" icon={<DeleteOutlined />} loading={isPending} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 md:p-6 overflow-hidden">
        <div className="overflow-x-auto">
          <Table
            dataSource={cartLocal.items}
            columns={columns}
            rowKey="id"
            pagination={false}
          />
        </div>

        <div className="mt-8 flex flex-col md:flex-row justify-between items-end md:items-center bg-gray-50 p-6 rounded-xl border border-gray-100">
          <div className="text-gray-500 mb-4 md:mb-0 text-lg">
            Sản phẩm: <span className="font-bold text-gray-800">{cartLocal.items.length}</span>
          </div>
          <div className="flex items-center gap-6 flex-wrap justify-end">
            <div className="text-xl text-gray-600">
              Tổng cộng: <span className="text-3xl font-black text-indigo-600 drop-shadow-sm ml-2">{formatPrice(cartLocal.total)}</span>
            </div>
            <Button
              type="primary"
              size="large"
              className="h-12 px-8 bg-black hover:bg-gray-800 font-bold text-[16px] rounded-xl shadow-lg w-full md:w-auto"
              onClick={() => {
                const token = localStorage.getItem("access_token");
                if (!token) {
                  message.warning("Vui lòng đăng nhập để tiến hành đặt hàng");
                  router.push("/login?redirect=/cart");
                  return;
                }
                setModalOpen(true);
              }}
            >
              Tiến hành Đặt hàng
            </Button>
          </div>
        </div>
      </div>
      <CheckoutModal 
        open={modalOpen} 
        onCancel={() => setModalOpen(false)} 
        totalPrice={cartLocal.total} 
        items={cartLocal.items} 
      />
    </>
  );
};
