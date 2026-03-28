"use client";

import { Drawer, Skeleton, Descriptions, Tag, Badge, Table, Divider } from "antd";
import { useCakeQuery } from "../hooks";
import { API_DOMAIN } from "@/lib/configs";
import { ICake } from "../types";

interface CakeDetailDrawerProps {
  visible: boolean;
  onClose: () => void;
  cakeId: string | null;
}

export const CakeDetailDrawer = ({ visible, onClose, cakeId }: CakeDetailDrawerProps) => {
  const { data: cake, isLoading, isError } = useCakeQuery(cakeId || "", visible && !!cakeId);

  const getFullImageUrl = (url?: string) => {
    if (!url) return "https://placehold.co/400x400?text=No+Image";
    return url.startsWith("http") ? url : `${API_DOMAIN}${url}`;
  };

  const variantColumns = [
    {
      title: "Kích thước",
      dataIndex: "size",
      key: "size",
      render: (text: string) => <Tag color="blue" className="font-bold">{text}</Tag>
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price: number) => (
        <span className="font-bold text-indigo-600">
          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)}
        </span>
      )
    },
    {
      title: "Kho",
      dataIndex: "stock",
      key: "stock",
      render: (stock: number) => (
        <Badge count={stock} overflowCount={999} color={stock > 10 ? "green" : "red"} />
      )
    }
  ];

  return (
    <Drawer
      title={<span className="text-xl font-black text-gray-900">Chi Tiết Sản Phẩm</span>}
      placement="right"
      onClose={onClose}
      open={visible}
      width={600}
      className="cake-detail-drawer"
    >
      {isLoading ? (
        <Skeleton active avatar paragraph={{ rows: 15 }} />
      ) : isError || !cake ? (
        <div className="p-10 text-center text-red-500 font-bold">Không thể tải thông tin sản phẩm.</div>
      ) : (
        <div className="space-y-6">
          <div className="aspect-square w-full rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
            <img 
              src={cake.imageUrl} 
              alt={cake.name} 
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-2xl font-black text-gray-900 leading-tight">{cake.name}</h2>
              <Tag color={cake.stock > 0 ? "success" : "error"} className="rounded-full px-3 py-0.5 font-bold uppercase text-[10px]">
                {cake.stock > 0 ? "Còn hàng" : "Hết hàng"}
              </Tag>
            </div>
            {cake.categories && cake.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {cake.categories.map(cat => (
                  <Tag key={cat._id} color="magenta" className="rounded-full border-none bg-magenta-50 text-magenta-600 font-medium">
                    {cat.name}
                  </Tag>
                ))}
              </div>
            )}
            <p className="text-gray-500 leading-relaxed text-[14px]">{cake.description || "Chưa có mô tả cho sản phẩm này."}</p>
          </div>

          <Divider dashed className="my-0" />

          <Descriptions column={1} className="cake-info-desc">
            <Descriptions.Item label={<span className="text-gray-400 font-bold uppercase text-[11px] tracking-wider">Giá cơ bản</span>}>
              <span className="text-lg font-black text-indigo-600">{cake.formattedPrice}</span>
            </Descriptions.Item>
            <Descriptions.Item label={<span className="text-gray-400 font-bold uppercase text-[11px] tracking-wider">Tổng tồn kho</span>}>
              <span className="font-bold text-gray-700">{cake.stock} sản phẩm</span>
            </Descriptions.Item>
          </Descriptions>

          {cake.variants && cake.variants.length > 0 && (
            <div>
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Các phiên bản sản phẩm</h3>
              <Table 
                dataSource={cake.variants} 
                columns={variantColumns} 
                pagination={false} 
                rowKey="_id"
                size="small"
                className="border border-gray-100 rounded-xl overflow-hidden shadow-sm"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Thông số</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-[13px]">
                  <span className="text-gray-400">Trọng lượng:</span>
                  <span className="font-bold text-gray-700">{cake.specifications?.weight || "N/A"}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-gray-400">Khẩu phần:</span>
                  <span className="font-bold text-gray-700">{cake.specifications?.servings || "N/A"}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Thành phần</h3>
              <div className="flex flex-wrap gap-1.5">
                {cake.ingredients && cake.ingredients.length > 0 ? (
                  cake.ingredients.map((ing, i) => (
                    <span key={i} className="text-[12px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg font-medium">
                      {ing}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 italic text-xs">Chưa cập nhật</span>
                )}
              </div>
            </div>
          </div>

          {cake.tags && cake.tags.length > 0 && (
            <div>
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {cake.tags.map((tag, i) => (
                  <Tag key={i} color="blue" className="rounded-full border-blue-100 bg-blue-50 text-blue-600">
                    #{tag}
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      <style jsx global>{`
        .cake-detail-drawer .ant-drawer-header {
           border-bottom: 1px solid #f8f8f8;
           padding: 24px;
        }
        .cake-detail-drawer .ant-drawer-body {
           padding: 24px;
        }
        .cake-info-desc .ant-descriptions-item-label {
           width: 120px;
        }
      `}</style>
    </Drawer>
  );
};
