"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal, Form, Input, InputNumber, App } from "antd";
import { useCreateCakeMutation, useUpdateCakeMutation } from "../hooks";
import { ICake } from "../types";
import { useEffect } from "react";

const cakeSchema = z.object({
  name: z.string().min(2, "Tên bánh phải có ít nhất 2 ký tự"),
  description: z.string().optional(),
  price: z.number().min(1000, "Giá bánh phải lớn hơn 1000đ"),
  stock: z.number().min(0, "Số lượng không được âm").default(0),
  image_url: z.string().url("URL ảnh không hợp lệ").optional().or(z.literal("")),
});

type CakeFormValues = {
  name: string;
  description?: string;
  price: number;
  stock: number;
  image_url?: string;
};

interface CakeFormModalProps {
  open: boolean;
  onCancel: () => void;
  initialData?: ICake | null;
}

export const CakeFormModal = ({ open, onCancel, initialData }: CakeFormModalProps) => {
  const { message } = App.useApp();
  const isEditing = !!initialData;
  const { mutate: createCake, isPending: isCreating } = useCreateCakeMutation();
  const { mutate: updateCake, isPending: isUpdating } = useUpdateCakeMutation();
  const isPending = isCreating || isUpdating;

  const { control, handleSubmit, formState: { errors }, reset, setValue } = useForm<CakeFormValues>({
    resolver: zodResolver(cakeSchema) as any,
    defaultValues: { name: "", description: "", price: 0, stock: 0, image_url: "" },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        setValue("name", initialData.name);
        setValue("description", initialData.description || "");
        setValue("price", initialData.price);
        setValue("stock", initialData.stock || 0);
        setValue("image_url", initialData.imageUrl === "https://placehold.co/100x100?text=No+Image" ? "" : initialData.imageUrl);
      } else {
        reset();
      }
    }
  }, [open, initialData, setValue, reset]);

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
            render={({ field }) => <Input {...field} placeholder="Ví dụ: Bánh Mousse Trà Xanh" size="large" className="rounded-lg" />}
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
                <InputNumber {...field} className="w-full rounded-lg" size="large" min={0} step={1000} placeholder="Ví dụ: 150000" />
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
                <InputNumber {...field} className="w-full rounded-lg" size="large" min={0} placeholder="Số lượng" />
              )}
            />
          </Form.Item>
        </div>

        <Form.Item
          label={<span className="font-semibold text-gray-700">Hình Ảnh (Full URL)</span>}
          validateStatus={errors.image_url ? "error" : ""}
          help={errors.image_url?.message}
        >
          <Controller
            name="image_url"
            control={control}
            render={({ field }) => <Input {...field} placeholder="https://domain.com/image.jpg" size="large" className="rounded-lg" />}
          />
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
