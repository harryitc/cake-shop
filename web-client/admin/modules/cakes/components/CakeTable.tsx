"use client";

import { Table, Button, Popconfirm, message, Skeleton } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useCakesQuery, useDeleteCakeMutation } from "../hooks";
import { ICake } from "../types";
import { CakeFormModal } from "./CakeFormModal";

export const CakeTable = () => {
  const { data, isLoading, isError } = useCakesQuery();
  const { mutate: deleteCake, isPending: isDeleting } = useDeleteCakeMutation();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCake, setSelectedCake] = useState<ICake | null>(null);

  const handleCreate = () => {
    setSelectedCake(null);
    setModalOpen(true);
  };

  const handleEdit = (cake: ICake) => {
    setSelectedCake(cake);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteCake(id, {
      onSuccess: () => message.success("Đã xóa Sản Phẩm"),
      onError: (err) => message.error(err.message || "Tác động thất bại"),
    });
  };

  if (isLoading) return <div className="p-8 bg-white mt-4 rounded-3xl border border-gray-100"><Skeleton active paragraph={{ rows: 10 }} /></div>;
  if (isError) return <div className="p-8 text-center text-red-500 font-bold bg-white rounded-3xl shadow-sm border border-red-100">Lỗi không thể tải danh sách sản phẩm. Có thể do kết nối.</div>;

  const columns = [
    {
      title: "Ảnh Đại Diện",
      key: "image",
      render: (_: any, record: ICake) => (
        <img src={record.imageUrl} alt={record.name} className="w-[72px] h-[72px] rounded-xl object-cover shadow-sm bg-gray-50 border border-gray-100" />
      ),
      width: 120,
    },
    {
      title: "Tên Sản Phẩm",
      dataIndex: "name",
      key: "name",
      className: "font-bold text-gray-800 text-[15px]",
    },
    {
      title: "Danh mục",
      key: "category",
      render: (_: any, record: ICake) => (
        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-semibold">
          {(record as any).category?.name || "Chưa phân loại"}
        </span>
      ),
    },
    {
      title: "Đơn Giá",
      dataIndex: "formattedPrice",
      key: "price",
      className: "font-semibold text-indigo-600 text-[15px]",
    },
    {
      title: "Tồn Kho",
      dataIndex: "stock",
      key: "stock",
      render: (val: number) => (
        <span className={`font-bold ${val === 0 ? "text-red-500" : "text-green-600"}`}>
          {val === 0 ? "Hết hàng" : val}
        </span>
      ),
    },
    {
      title: "Ngày Đăng",
      dataIndex: "formattedDate",
      key: "createdAt",
      className: "text-gray-500",
    },
    {
      title: "Quản Trị",
      key: "action",
      render: (_: any, record: ICake) => (
        <div className="flex gap-2">
          <Button 
            type="text" 
            className="hover:bg-indigo-50 transition-colors rounded-lg"
            icon={<EditOutlined className="text-indigo-600" />} 
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Xóa Bánh Này?"
            description={`Bạn có chắc muốn xóa vĩnh viễn sản phẩm ${record.name}?`}
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa luôn"
            cancelText="Giữ lại"
          >
            <Button danger type="text" className="hover:bg-red-50 transition-colors rounded-lg" icon={<DeleteOutlined />} loading={isDeleting} />
          </Popconfirm>
        </div>
      ),
      width: 150,
    },
  ];

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 md:gap-0">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Danh Mục Bánh</h1>
          <p className="text-gray-500 font-medium mt-1">Quản lý kho hàng, tinh chỉnh thông tin và cập nhật hiển thị lên trang User.</p>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large"
          className="bg-indigo-600 hover:bg-indigo-700 shadow-[0_4px_10px_-2px_rgba(83,58,253,0.3)] font-extrabold rounded-xl h-12 px-6"
          onClick={handleCreate}
        >
          Tạo Bánh Cho Menu
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table 
          dataSource={data?.items || []} 
          columns={columns} 
          rowKey="id" 
          pagination={{ pageSize: 10 }}
          className="border-t border-gray-100 pt-2"
        />
      </div>

      <CakeFormModal 
        open={modalOpen} 
        onCancel={() => setModalOpen(false)} 
        initialData={selectedCake}
      />
    </div>
  );
};
