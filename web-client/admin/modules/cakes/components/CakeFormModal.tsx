"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal, Form, Input, InputNumber, App, Upload, Button, Select, Tabs, Space, Divider, Tag } from "antd";
import { PlusOutlined, UploadOutlined, LoadingOutlined, MinusCircleOutlined, MagicWandOutlined, ThunderboltOutlined } from "@ant-design/icons";
// ... (rest of imports)

const CAKE_PRESETS = {
  MOUSSE: {
    namePrefix: "Bánh Mousse ",
    description: "Hương vị thanh mát từ lớp kem mịn màng, tan chảy ngay đầu lưỡi. Sự kết hợp hoàn hảo giữa trái cây tươi và mousse hảo hạng.",
    tags: ["Thanh mát", "Mùa hè", "Mousse"],
    variants: [
      { size: "10cm (Hộp)", price: 120000, stock: 10 },
      { size: "15cm", price: 250000, stock: 5 }
    ],
    ingredients: ["Kem tươi", "Trái cây tươi", "Gelatin", "Đường"]
  },
  BIRTHDAY: {
    namePrefix: "Bánh Kem Sinh Nhật ",
    description: "Chiếc bánh kem trang trọng dành riêng cho những buổi tiệc sinh nhật. Cốt bánh bông lan mềm mịn cùng lớp kem trang trí tinh tế.",
    tags: ["Sinh nhật", "Tiệc tùng", "Phổ biến"],
    variants: [
      { size: "15cm", price: 300000, stock: 5 },
      { size: "20cm", price: 450000, stock: 3 },
      { size: "25cm", price: 650000, stock: 2 }
    ],
    ingredients: ["Bột mì", "Trứng gà", "Bơ lạt", "Kem trang trí"]
  },
  HEALTHY: {
    namePrefix: "Bánh Healthy ",
    description: "Lựa chọn hoàn hảo cho lối sống lành mạnh. Bánh sử dụng nguyên liệu tự nhiên, ít đường và không chứa chất bảo quản.",
    tags: ["Keto", "Ít đường", "Healthy"],
    variants: [
      { size: "15cm", price: 350000, stock: 5 }
    ],
    ingredients: ["Bột hạnh nhân", "Đường cỏ ngọt", "Trái cây khô", "Hạt dinh dưỡng"]
  }
};

const QUICK_PHRASES = [
  "Hương vị đậm đà nguyên chất.",
  "Nguyên liệu cao cấp nhập khẩu.",
  "Cốt bánh ẩm mịn, tan chảy.",
  "Thiết kế tinh tế, sang trọng.",
  "Không chất bảo quản, an toàn sức khỏe."
];
import { useCreateCakeMutation, useUpdateCakeMutation, useUploadImageMutation } from "../hooks";
import { ICake } from "../types";
import { useEffect, useState } from "react";
import { httpClient } from "@/lib/http";

const cakeSchema = z.object({
  name: z.string().min(2, "Tên bánh phải có ít nhất 2 ký tự"),
  category: z.string().min(1, "Vui lòng chọn danh mục chính"),
  categories: z.array(z.string()).optional(),
  description: z.string().optional(),
  price: z.number().min(0, "Giá bánh không được âm"),
  stock: z.number().min(0, "Số lượng không được âm").default(0),
  image_url: z.string().optional(),
  variants: z.array(z.object({
    size: z.string().min(1, "Vui lòng nhập kích thước"),
    price: z.number().min(0, "Giá không được âm"),
    stock: z.number().min(0, "Tồn kho không được âm"),
  })).optional(),
  tags: z.array(z.string()).optional(),
  ingredients: z.array(z.string()).optional(),
  specifications: z.object({
    weight: z.string().optional(),
    servings: z.string().optional(),
  }).optional(),
});

type CakeFormValues = {
  name: string;
  category: string;
  categories: string[];
  description?: string;
  price: number;
  stock: number;
  image_url?: string;
  variants?: { size: string; price: number; stock: number }[];
  tags?: string[];
  ingredients?: string[];
  specifications?: {
    weight?: string;
    servings?: string;
  };
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
    defaultValues: { 
      name: "", category: "", categories: [], description: "", price: 0, stock: 0, image_url: "",
      variants: [], tags: [], ingredients: [], specifications: { weight: "", servings: "" }
    },
  });

  const currentImageUrl = watch("image_url");
  const currentDescription = watch("description") || "";

  const applyPreset = (type: keyof typeof CAKE_PRESETS) => {
    const preset = CAKE_PRESETS[type];
    setValue("name", preset.namePrefix);
    setValue("description", preset.description);
    setValue("tags", preset.tags);
    setValue("variants", preset.variants);
    setValue("ingredients", preset.ingredients);
    message.success(`Đã áp dụng mẫu ${type}`);
  };

  const appendDescription = (phrase: string) => {
    const newDesc = currentDescription ? `${currentDescription} ${phrase}` : phrase;
    setValue("description", newDesc);
  };

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
        setValue("categories", (initialData.categories || []).map(c => typeof c === 'object' ? c._id : c));
        setValue("description", initialData.description || "");
        setValue("price", initialData.price);
        setValue("stock", initialData.stock || 0);
        setValue("variants", initialData.variants || []);
        setValue("tags", initialData.tags || []);
        setValue("ingredients", initialData.ingredients || []);
        setValue("specifications", {
          weight: initialData.specifications?.weight || "",
          servings: initialData.specifications?.servings || ""
        });
        
        const path = initialData.imageUrl.startsWith("http") && !initialData.imageUrl.includes(API_DOMAIN)
          ? initialData.imageUrl 
          : initialData.imageUrl.replace(API_DOMAIN, "");
        setValue("image_url", path === "https://placehold.co/100x100?text=No+Image" ? "" : path);
      } else {
        reset({ 
          name: "", category: "", categories: [], description: "", price: 0, stock: 0, image_url: "",
          variants: [], tags: [], ingredients: [], specifications: { weight: "", servings: "" }
        });
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
    return false;
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

  const renderBasicInfo = () => (
    <div className="space-y-4">
      <Form.Item label={<span className="font-semibold text-gray-700">Tên Bánh</span>} validateStatus={errors.name ? "error" : ""} help={errors.name?.message} required>
        <Controller name="name" control={control} render={({ field }) => <Input {...field} placeholder="Ví dụ: Bánh Mousse Trà Xanh" size="large" className="rounded-xl h-[45px]" />} />
      </Form.Item>

      <div className="flex gap-4">
        <Form.Item label={<span className="font-semibold text-gray-700">Danh Mục Chính</span>} className="flex-1" validateStatus={errors.category ? "error" : ""} help={errors.category?.message} required>
          <Controller name="category" control={control} render={({ field }) => (
            <Select {...field} placeholder="Chọn danh mục chính" size="large" className="rounded-xl w-full" options={categories.map(c => ({ label: c.name, value: c._id }))} style={{ height: '45px' }} />
          )} />
        </Form.Item>
        <Form.Item label={<span className="font-semibold text-gray-700">Danh Mục Phụ (Đa chọn)</span>} className="flex-[1.5]">
          <Controller name="categories" control={control} render={({ field }) => (
            <Select {...field} mode="multiple" placeholder="Chọn các danh mục khác" size="large" className="rounded-xl w-full" options={categories.map(c => ({ label: c.name, value: c._id }))} style={{ minHeight: '45px' }} />
          )} />
        </Form.Item>
      </div>

      <div className="flex gap-4">
        <Form.Item label={<span className="font-semibold text-gray-700">Đơn Giá Mặc Định</span>} className="flex-1" required>
          <Controller name="price" control={control} render={({ field }) => (
            <InputNumber {...field} className="w-full rounded-xl border-gray-200" size="large" min={0} step={1000} placeholder="150,000" formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} parser={(value) => value!.replace(/\$\s?|(,*)/g, "") as any} style={{ width: '100%', height: '45px', display: 'flex', alignItems: 'center', fontSize: '18px', fontWeight: 'bold' }} />
          )} />
        </Form.Item>
        <Form.Item label={<span className="font-semibold text-gray-700">Tổng Tồn Kho</span>} className="flex-1" required>
          <Controller name="stock" control={control} render={({ field }) => <InputNumber {...field} className="w-full rounded-xl border-gray-200" size="large" min={0} placeholder="Số lượng" style={{ width: '100%', height: '45px', display: 'flex', alignItems: 'center' }} />} />
        </Form.Item>
      </div>

      <Form.Item label={<span className="font-semibold text-gray-700">Mô Tả Sản Phẩm</span>}>
        <Controller name="description" control={control} render={({ field }) => <Input.TextArea {...field} rows={4} placeholder="Nhập cấu tạo, thành phần..." className="rounded-xl" />} />
      </Form.Item>
    </div>
  );

  const renderVariants = () => (
    <div className="py-4">
      <div className="bg-indigo-50 p-4 rounded-xl mb-6 flex items-start gap-3">
        <div className="text-indigo-600 mt-0.5"><PlusOutlined /></div>
        <div className="text-indigo-700 text-sm">
          Thêm các tùy chọn như <b>Kích thước (Size)</b> khác nhau. Nếu không có biến thể, hệ thống sẽ sử dụng <b>Đơn Giá Mặc Định</b> ở tab Thông tin cơ bản.
        </div>
      </div>
      
      <Form.List name="variants">
        {(fields, { add, remove }) => (
          <div className="space-y-4">
            {fields.map(({ key, name, ...restField }) => (
              <div key={key} className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50/30">
                <Form.Item {...restField} name={[name, 'size']} className="flex-[1.5] mb-0" rules={[{ required: true, message: 'Nhập size' }]}>
                  <Input placeholder="Kích thước (vd: 20cm)" className="rounded-lg h-10" />
                </Form.Item>
                <Form.Item {...restField} name={[name, 'price']} className="flex-1 mb-0" rules={[{ required: true, message: 'Nhập giá' }]}>
                  <InputNumber placeholder="Giá" className="w-full rounded-lg h-10" formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} parser={(value) => value!.replace(/\$\s?|(,*)/g, "") as any} />
                </Form.Item>
                <Form.Item {...restField} name={[name, 'stock']} className="flex-1 mb-0" rules={[{ required: true, message: 'Nhập tồn' }]}>
                  <InputNumber placeholder="Tồn" className="w-full rounded-lg h-10" />
                </Form.Item>
                <Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => remove(name)} className="mt-1" />
              </div>
            ))}
            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} className="h-10 rounded-xl border-indigo-200 text-indigo-600">
              Thêm Biến Thể Mới
            </Button>
          </div>
        )}
      </Form.List>
    </div>
  );

  const renderAdvanced = () => (
    <div className="space-y-6 py-4">
      <div className="grid grid-cols-2 gap-6">
        <Form.Item label={<span className="font-semibold text-gray-700">Gắn Thẻ (Tags)</span>}>
          <Controller name="tags" control={control} render={({ field }) => (
            <Select {...field} mode="tags" placeholder="Nhập tag (vd: Best Seller, New)" size="large" className="rounded-xl w-full" />
          )} />
        </Form.Item>
        <Form.Item label={<span className="font-semibold text-gray-700">Thành Phần (Ingredients)</span>}>
          <Controller name="ingredients" control={control} render={({ field }) => (
            <Select {...field} mode="tags" placeholder="Nhập thành phần" size="large" className="rounded-xl w-full" />
          )} />
        </Form.Item>
      </div>

      <Divider className="my-2" />
      <h4 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-4">Thông số kỹ thuật</h4>
      
      <div className="grid grid-cols-2 gap-6">
        <Form.Item label={<span className="font-semibold text-gray-700">Trọng Lượng (vd: 500g)</span>}>
          <Controller name="specifications.weight" control={control} render={({ field }) => <Input {...field} placeholder="Cân nặng ước tính" size="large" className="rounded-xl" />} />
        </Form.Item>
        <Form.Item label={<span className="font-semibold text-gray-700">Số Người Ăn (vd: 4-6 người)</span>}>
          <Controller name="specifications.servings" control={control} render={({ field }) => <Input {...field} placeholder="Số người phục vụ" size="large" className="rounded-xl" />} />
        </Form.Item>
      </div>

      <Form.Item label={<span className="font-semibold text-gray-700">Hình Ảnh Sản Phẩm</span>}>
        <div className="flex flex-col gap-4">
          <Upload name="image" listType="picture-card" showUploadList={false} beforeUpload={handleUpload} className="cake-upload">
            {currentImageUrl ? (
              <img src={currentImageUrl.startsWith("http") ? currentImageUrl : `${API_DOMAIN}${currentImageUrl}`} alt="cake" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
            ) : (
              <div className="flex flex-col items-center">
                {isUploading ? <LoadingOutlined /> : <PlusOutlined />}
                <div className="mt-2 text-gray-500 font-medium">Tải ảnh lên</div>
              </div>
            )}
          </Upload>
          <Controller name="image_url" control={control} render={({ field }) => <Input {...field} placeholder="Đường dẫn ảnh" className="rounded-xl h-[40px]" prefix={<UploadOutlined className="text-gray-400" />} />} />
        </div>
      </Form.Item>
    </div>
  );

  return (
    <Modal
      title={<span className="text-xl font-black text-gray-800 tracking-tight">{isEditing ? "Chỉnh sửa Thông tin Bánh" : "Tạo Mới Sản Phẩm Bánh Cao Cấp"}</span>}
      open={open}
      onCancel={onCancel}
      confirmLoading={isPending}
      onOk={() => handleSubmit(onSubmit)()}
      okText={isEditing ? "Lưu Thay Đổi" : "Tạo Mới"}
      cancelText="Hủy Bỏ"
      width={750}
      okButtonProps={{ className: "bg-indigo-600 hover:bg-indigo-700 font-bold px-8 h-12 rounded-xl" }}
      cancelButtonProps={{ className: "px-6 h-12 font-semibold rounded-xl" }}
    >
      <Form form={undefined} layout="vertical" className="mt-4">
        <Tabs defaultActiveKey="1" items={[
          { key: '1', label: <span className="font-bold px-2">Thông tin cơ bản</span>, children: renderBasicInfo() },
          { key: '2', label: <span className="font-bold px-2">Biến thể (Size/Giá)</span>, children: renderVariants() },
          { key: '3', label: <span className="font-bold px-2">Nâng cao & Ảnh</span>, children: renderAdvanced() },
        ]} className="custom-cake-tabs" />
      </Form>
      <style jsx global>{`
        .custom-cake-tabs .ant-tabs-nav::before { border-bottom: 2px solid #f0f0f0; }
        .custom-cake-tabs .ant-tabs-tab-active .ant-tabs-tab-btn { color: #4f46e5 !important; }
        .custom-cake-tabs .ant-tabs-ink-bar { background: #4f46e5 !important; height: 3px !important; border-radius: 3px; }
      `}</style>
    </Modal>
  );
};
