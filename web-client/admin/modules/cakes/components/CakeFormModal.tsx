"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal, Form, Input, InputNumber, App, Upload, Button, Select } from "antd";
import { PlusOutlined, UploadOutlined, LoadingOutlined } from "@ant-design/icons";
import { useCreateCakeMutation, useUpdateCakeMutation, useUploadImageMutation } from "../hooks";
import { ICake } from "../types";
import { useEffect, useState } from "react";
import { httpClient } from "@/lib/http";

const cakeSchema = z.object({
  name: z.string().min(2, "Tên bánh phải có ít nhất 2 ký tự"),
  category: z.string().min(1, "Vui lòng chọn danh mục"),
  description: z.string().optional(),
  price: z.number().min(1000, "Giá bánh phải lớn hơn 1000đ"),
  stock: z.number().min(0, "Số lượng không được âm").default(0),
  image_url: z.string().optional(),
});

type CakeFormValues = {
  name: string;
  category: string;
  description?: string;
  price: number;
  stock: number;
  image_url?: string;
};

interface Category {
  _id: string;
  name: string;
}

interface CakeFormModalProps {
  open: boolean;
  onCancel: () => void;
  initialData?: ICake | null;
}

const API_DOMAIN = process.env.NEXT_PUBLIC_API_DOMAIN || "http://localhost:5000";

export const CakeFormModal = ({ open, onCancel, initialData }: CakeFormModalProps) => {
  const { message } = App.useApp();
  const isEditing = !!initialData;
  const { mutate: createCake, isPending: isCreating } = useCreateCakeMutation();
  const { mutate: updateCake, isPending: isUpdating } = useUpdateCakeMutation();
  const { mutate: uploadImage, isPending: isUploading } = useUploadImageMutation();
  const [categories, setCategories] = useState<Category[]>([]);
  const isPending = isCreating || isUpdating;

  const { control, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<CakeFormValues>({
    resolver: zodResolver(cakeSchema) as any,
    defaultValues: { name: "", category: "", description: "", price: 0, stock: 0, image_url: "" },
  });

  const currentImageUrl = watch("image_url");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await httpClient<Category[]>('/categories');
        setCategories(data);
      } catch (err) {
        console.error('Lỗi khi tải danh mục:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setValue("name", initialData.name);
        setValue("category", (initialData as any).category?._id || (initialData as any).category || "");
        setValue("description", initialData.description || "");
        setValue("price", initialData.price);
        setValue("stock", initialData.stock || 0);
        // Lưu path gốc (không có domain) vào form state
        const path = initialData.imageUrl.startsWith("http") && !initialData.imageUrl.includes(API_DOMAIN)
          ? initialData.imageUrl 
          : initialData.imageUrl.replace(API_DOMAIN, "");
        setValue("image_url", path === "https://placehold.co/100x100?text=No+Image" ? "" : path);
      } else {
        reset();
      }
    }
  }, [open, initialData, setValue, reset]);

  const handleUpload = (file: File) => {
    uploadImage(file, {
      onSuccess: (data) => {
        setValue("image_url", data.path);
        message.success("Upload ảnh thành công");
      },
      onError: (err) => message.error(err.message || "Upload ảnh thất bại"),
    });
    return false; // Chặn antd tự upload
  };

  const onSubmit = (values: CakeFormValues) => {
    const payload = { ...values, image_url: values.image_url || undefined };

    if (isEditing) {
      updateCake({ id: initialData.id, payload }, {
        onSuccess: () => {
          message.success("Cập nhật bánh thành công");
          onCancel();
        },
        onError: (err) => message.error(err.message || "Lỗi thiết lập"),
      });
    } else {
      createCake(payload as any, {
        onSuccess: () => {
          message.success("Thêm bánh mới thành công");
          onCancel();
        },
        onError: (err) => message.error(err.message || "Lỗi thêm hệ thống"),
      });
    }
  };

  return (
    <Modal
      title={<span className="text-xl font-black text-gray-800 tracking-tight">{isEditing ? "Chỉnh sửa Thông tin" : "Tạo Mới Sản Phẩm Bánh"}</span>}
      open={open}
      onCancel={onCancel}
      confirmLoading={isPending}
      onOk={() => handleSubmit(onSubmit)()}
      okText={isEditing ? "Lưu Thay Đổi" : "Tạo Mới"}
      cancelText="Hủy Bỏ"
      width={600}
      okButtonProps={{ className: "bg-indigo-600 hover:bg-indigo-700 font-bold px-6 h-10 rounded-lg" }}
      cancelButtonProps={{ className: "px-6 h-10 font-semibold" }}
    >
      <Form layout="vertical" className="mt-6">
        <Form.Item
          label={<span className="font-semibold text-gray-700">Tên Bánh/Sản Phẩm</span>}
          validateStatus={errors.name ? "error" : ""}
          help={errors.name?.message}
          required
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Ví dụ: Bánh Mousse Trà Xanh" size="large" className="rounded-xl h-[45px]" />}
          />
        </Form.Item>

        <Form.Item
          label={<span className="font-semibold text-gray-700">Danh Mục Sản Phẩm</span>}
          validateStatus={errors.category ? "error" : ""}
          help={errors.category?.message}
          required
        >
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="Chọn danh mục"
                size="large"
                className="rounded-xl w-full"
                options={categories.map(c => ({ label: c.name, value: c._id }))}
                style={{ height: '45px' }}
              />
            )}
          />
        </Form.Item>

        <div className="flex gap-4">
          <Form.Item
            className="flex-1"
            label={<span className="font-semibold text-gray-700">Đơn Giá (VNĐ)</span>}
            validateStatus={errors.price ? "error" : ""}
            help={errors.price?.message}
            required
          >
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <InputNumber 
                  {...field} 
                  className="w-full rounded-xl border-gray-200" 
                  size="large" 
                  min={0} 
                  step={1000} 
                  placeholder="Ví dụ: 150,000" 
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, "") as any}
                  style={{ width: '100%', height: '45px', display: 'flex', alignItems: 'center', fontSize: '18px', fontWeight: 'bold' }}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            className="flex-1"
            label={<span className="font-semibold text-gray-700">Tồn Kho</span>}
            validateStatus={errors.stock ? "error" : ""}
            help={errors.stock?.message}
            required
          >
            <Controller
              name="stock"
              control={control}
              render={({ field }) => (
                <InputNumber 
                  {...field} 
                  className="w-full rounded-xl border-gray-200" 
                  size="large" 
                  min={0} 
                  placeholder="Số lượng" 
                  style={{ width: '100%', height: '45px', display: 'flex', alignItems: 'center' }}
                />
              )}
            />
          </Form.Item>
        </div>

        <Form.Item
          label={<span className="font-semibold text-gray-700">Hình Ảnh Sản Phẩm</span>}
          validateStatus={errors.image_url ? "error" : ""}
          help={errors.image_url?.message}
        >
          <div className="flex flex-col gap-4">
            <Upload
              name="image"
              listType="picture-card"
              showUploadList={false}
              beforeUpload={handleUpload}
              className="cake-upload"
            >
              {currentImageUrl ? (
                <img 
                  src={currentImageUrl.startsWith("http") ? currentImageUrl : `${API_DOMAIN}${currentImageUrl}`} 
                  alt="cake" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} 
                />
              ) : (
                <div className="flex flex-col items-center">
                  {isUploading ? <LoadingOutlined /> : <PlusOutlined />}
                  <div className="mt-2 text-gray-500 font-medium">Tải ảnh lên</div>
                </div>
              )}
            </Upload>
            
            <div className="text-gray-400 text-xs italic">
              * Hệ thống ưu tiên lưu trữ ảnh nội bộ. Bạn cũng có thể dán link trực tiếp nếu cần.
            </div>
            <Controller
              name="image_url"
              control={control}
              render={({ field }) => (
                <Input 
                  {...field} 
                  placeholder="Đường dẫn ảnh (tự động điền khi upload)" 
                  className="rounded-lg" 
                  prefix={<UploadOutlined className="text-gray-400" />}
                />
              )}
            />
          </div>
        </Form.Item>

        <Form.Item
          label={<span className="font-semibold text-gray-700">Mô Tả Sinh Động</span>}
        >
          <Controller
            name="description"
            control={control}
            render={({ field }) => <Input.TextArea {...field} rows={5} placeholder="Nhập cấu tạo, thành phần, vị trí..." className="rounded-lg" />}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
