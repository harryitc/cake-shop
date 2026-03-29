"use client";

import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, Input, InputNumber, App, Upload, Button, Select, Divider, Tag, Modal, Skeleton } from "antd";
import { 
  PlusOutlined, 
  LoadingOutlined, 
  MinusCircleOutlined, 
  InfoCircleOutlined,
  DollarCircleOutlined,
  PictureOutlined,
  TagsOutlined,
  EyeOutlined,
  LeftOutlined,
  CakeOutlined
} from "@ant-design/icons";
import { useEffect, useState, useRef, useCallback } from "react";
import { useCreateCakeMutation, useUpdateCakeMutation, useUploadImageMutation } from "../hooks";
import { useCategoriesQuery } from "../../categories/hooks";
import { ICake } from "../types";
import { API_DOMAIN } from "@/lib/configs";
import { useRouter } from "next/navigation";

const cakeSchema = z.object({
  name: z.string().min(2, "Tên bánh phải có ít nhất 2 ký tự"),
  category: z.string().min(1, "Vui lòng chọn danh mục chính"),
  categories: z.array(z.string()).optional(),
  description: z.string().optional(),
  price: z.number().min(0, "Giá bánh không được âm"),
  stock: z.number().min(0, "Số lượng không được âm"),
  image_url: z.string().optional(),
  variants: z.array(z.object({
    _id: z.string().optional(),
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
  variants?: { _id?: string; size: string; price: number; stock: number }[];
  tags?: string[];
  ingredients?: string[];
  specifications?: {
    weight?: string;
    servings?: string;
  };
};

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
  "Hương vị nguyên bản.",
  "Nguyên liệu cao cấp.",
  "Cốt bánh bông xốp.",
  "Thiết kế sang trọng.",
  "Không chất bảo quản."
];

interface CakeStudioFormProps {
  initialData?: ICake | null;
  loading?: boolean;
}

const SECTIONS = [
  { id: 'section-basic', label: 'Thông tin cơ bản', icon: <InfoCircleOutlined /> },
  { id: 'section-pricing', label: 'Giá & Biến thể', icon: <DollarCircleOutlined /> },
  { id: 'section-media', label: 'Hình ảnh & Mô tả', icon: <PictureOutlined /> },
  { id: 'section-attributes', label: 'Đặc tính & Thẻ', icon: <TagsOutlined /> },
];

export const CakeStudioForm = ({ initialData, loading = false }: CakeStudioFormProps) => {
  const router = useRouter();
  const { message } = App.useApp();
  const isEditing = !!initialData;
  const [activeSection, setActiveSection] = useState('section-basic');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  const { data: categoriesData, isLoading: categoriesLoading } = useCategoriesQuery();
  const categories = categoriesData || [];

  const { mutate: createCake, isPending: isCreating } = useCreateCakeMutation();
  const { mutate: updateCake, isPending: isUpdating } = useUpdateCakeMutation();
  const { mutate: uploadImage, isPending: isUploading } = useUploadImageMutation();
  const isPending = isCreating || isUpdating;

  const { control, handleSubmit, formState: { errors, isDirty, isValid }, reset, setValue, watch } = useForm<CakeFormValues>({
    resolver: zodResolver(cakeSchema) as any,
    mode: "onChange",
    defaultValues: {
      name: "", category: "", categories: [], description: "", price: 0, stock: 0, image_url: "",
      variants: [], tags: [], ingredients: [], specifications: { weight: "", servings: "" }
    },
  });

  const { fields, append, remove: removeVariant } = useFieldArray({
    control,
    name: "variants",
  });

  const watchedValues = watch();
  const currentImageUrl = watchedValues.image_url;
  const currentDescription = watchedValues.description || "";

  const applyPreset = (type: keyof typeof CAKE_PRESETS) => {
    const preset = CAKE_PRESETS[type];
    setValue("name", preset.namePrefix, { shouldDirty: true });
    setValue("description", preset.description, { shouldDirty: true });
    setValue("tags", preset.tags, { shouldDirty: true });
    setValue("variants", preset.variants as any, { shouldDirty: true });
    setValue("ingredients", preset.ingredients, { shouldDirty: true });
    message.success(`Đã áp dụng mẫu ${type}`);
  };

  const appendDescription = (phrase: string) => {
    const newDesc = currentDescription ? `${currentDescription} ${phrase}` : phrase;
    setValue("description", newDesc, { shouldDirty: true });
  };

  const handleScroll = useCallback(() => {
    if (isScrollingRef.current || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollPos = container.scrollTop + 100;

    for (const section of SECTIONS) {
      const element = document.getElementById(section.id);
      if (element) {
        const { offsetTop, offsetHeight } = element;
        if (scrollPos >= offsetTop && scrollPos < offsetTop + offsetHeight) {
          setActiveSection(section.id);
          break;
        }
      }
    }
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element && scrollContainerRef.current) {
      isScrollingRef.current = true;
      setActiveSection(sectionId);
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
    }
  };

  useEffect(() => {
      if (initialData) {
        const path = (initialData.imageUrl || "").startsWith("http") && !initialData.imageUrl.includes(API_DOMAIN)
          ? initialData.imageUrl
          : (initialData.imageUrl || "").replace(API_DOMAIN, "");
        
        const finalImagePath = path === "https://placehold.co/100x100?text=No+Image" ? "" : path;

        reset({
          name: initialData.name,
          category: (initialData as any).category?.id || (initialData as any).category?._id || (initialData as any).category || "",
          categories: (initialData.categories || []).map(c => typeof c === 'object' ? (c as any).id || (c as any)._id : c),
          description: initialData.description || "",
          price: initialData.price,
          stock: initialData.stock || 0,
          variants: initialData.variants || [],
          tags: initialData.tags || [],
          ingredients: initialData.ingredients || [],
          specifications: {
            weight: initialData.specifications?.weight || "",
            servings: initialData.specifications?.servings || ""
          },
          image_url: finalImagePath
        });
      } else {
        reset({
          name: "", category: "", categories: [], description: "", price: 0, stock: 0, image_url: "",
          variants: [], tags: [], ingredients: [], specifications: { weight: "", servings: "" }
        });
      }
  }, [initialData, reset]);

  const handleUpload = (file: File) => {
    uploadImage(file, {
      onSuccess: (data) => {
        setValue("image_url", data.path, { shouldDirty: true });
        message.success("Upload ảnh thành công");
      },
      onError: (err) => {
        if (err.statuscode === 422) message.error(err.message);
      },
    });
    return false;
  };

  const onSubmit = (values: CakeFormValues) => {
    const payload = { ...values, image_url: values.image_url || undefined };

    if (isEditing) {
      updateCake({ id: initialData?.id || "", payload }, {
        onSuccess: () => {
          message.success("Cập nhật bánh thành công");
          router.push("/admin/cakes");
        },
        onError: (err) => {
          if (err.statuscode === 422) message.error(err.message);
        },
      });
    } else {
      createCake(payload as any, {
        onSuccess: () => {
          message.success("Thêm bánh mới thành công");
          router.push("/admin/cakes");
        },
        onError: (err) => {
          if (err.statuscode === 422) message.error(err.message);
        },
      });
    }
  };

  if (loading || categoriesLoading) return <div className="bg-white p-20 rounded-2xl"><Skeleton active paragraph={{ rows: 20 }} /></div>;

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans">
      <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 shadow-sm z-10 transition-all">
        <div className="flex items-center gap-4">
          <Button 
            type="text" 
            icon={<LeftOutlined />} 
            onClick={() => router.push("/admin/cakes")}
            className="hover:bg-gray-100 rounded-lg text-gray-400 h-8 w-8 flex items-center justify-center p-0"
          />
          <h1 className="text-sm font-bold text-gray-800 tracking-tight flex items-center gap-2">
             <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
             {isEditing ? `CẬP NHẬT: ${initialData?.name}` : "TẠO BÁNH MỚI TRÊN STUDIO"}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="text" color="default" onClick={() => router.push("/admin/cakes")} className="font-bold text-[11px] h-8 px-4 rounded-lg">
            HỦY BỎ
          </Button>
          <Button 
            type="primary" 
            onClick={handleSubmit(onSubmit)} 
            loading={isPending}
            disabled={!isDirty || !isValid}
            className="bg-indigo-600 hover:bg-indigo-700 font-bold text-[11px] h-8 px-6 rounded-lg shadow-sm"
          >
            {isEditing ? "LƯU THAY ĐỔI" : "XUẤT BẢN NGAY"}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-60 bg-white border-r border-gray-100 p-4 flex flex-col gap-1 shrink-0 overflow-y-auto">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Phân đoạn thiết kế</p>
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => scrollToSection(s.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-[12px] relative group ${
                activeSection === s.id 
                  ? "bg-indigo-50 text-indigo-600 shadow-sm" 
                  : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              }`}
            >
              <span className={`text-base transition-colors ${activeSection === s.id ? "text-indigo-600" : "text-gray-300 group-hover:text-gray-400"}`}>{s.icon}</span>
              {s.label}
              {activeSection === s.id && <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-200" />}
            </button>
          ))}
        </aside>

        <main 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto no-scrollbar bg-gray-50/20 p-8 scroll-smooth"
        >
          <div className="max-w-2xl mx-auto pb-96">
            <Form layout="vertical">
              <div id="section-basic" className="scroll-mt-6 mb-24">
                  <div className={`p-8 rounded-[24px] border transition-all duration-500 bg-white ${activeSection === 'section-basic' ? 'border-indigo-200 shadow-xl shadow-indigo-500/5' : 'border-transparent shadow-sm'}`}>
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 leading-tight">01. Danh tính sản phẩm</h2>
                            <p className="text-gray-400 font-medium text-[11px] uppercase tracking-wider mt-1">Định dạng và phân loại cơ bản</p>
                        </div>
                        {!isEditing && (
                            <div className="flex gap-1.5 flex-wrap justify-end">
                                {(Object.keys(CAKE_PRESETS) as Array<keyof typeof CAKE_PRESETS>).map(type => (
                                    <Button 
                                        key={type} 
                                        size="small" 
                                        onClick={() => applyPreset(type)}
                                        className="rounded-md font-bold text-[10px] h-6 px-3 bg-gray-50 border-gray-100 text-gray-500 hover:text-indigo-600"
                                    >
                                        + {type}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <Form.Item label={<span className="font-bold text-gray-700 text-[12px] px-1 tracking-tight">TÊN BÁNH THƯƠNG HIỆU</span>} validateStatus={errors.name ? "error" : ""} help={errors.name?.message} required className="mb-6">
                      <Controller name="name" control={control} render={({ field }) => <Input {...field} placeholder="Ví dụ: Bánh Mousse Trà Xanh Nhật Bản..." size="large" className="rounded-lg h-10 bg-gray-50 border-gray-100 font-bold text-sm px-4 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-none" />} />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-6">
                      <Form.Item label={<span className="font-bold text-gray-700 text-[12px] px-1 tracking-tight">DANH MỤC CỐT LÕI</span>} validateStatus={errors.category ? "error" : ""} help={errors.category?.message} required className="mb-0">
                        <Controller name="category" control={control} render={({ field }) => (
                          <Select {...field} placeholder="Chọn danh mục" size="large" className="rounded-lg w-full h-10 custom-studio-select-v4" options={categories.map(c => ({ label: c.name, value: c.id }))} />
                        )} />
                      </Form.Item>
                      <Form.Item label={<span className="font-bold text-gray-700 text-[12px] px-1 tracking-tight">DANH MỤC LIÊN QUAN</span>} className="mb-0">
                        <Controller name="categories" control={control} render={({ field }) => (
                          <Select {...field} mode="multiple" placeholder="Gắn nhãn phụ" size="large" className="rounded-lg w-full h-10 custom-studio-select-v4" options={categories.map(c => ({ label: c.name, value: c.id }))} />
                        )} />
                      </Form.Item>
                    </div>
                  </div>
              </div>

              <div id="section-pricing" className="scroll-mt-6 mb-24">
                  <div className={`p-8 rounded-[24px] border transition-all duration-500 bg-white ${activeSection === 'section-pricing' ? 'border-emerald-200 shadow-xl shadow-emerald-500/5' : 'border-transparent shadow-sm'}`}>
                    <h2 className="text-lg font-bold text-gray-900 mb-8">02. Thiết lập Giá & Tồn kho</h2>
                    <div className="grid grid-cols-2 gap-6">
                      <Form.Item label={<span className="font-bold text-gray-700 text-[12px] px-1 tracking-tight">GIÁ BÁN CƠ BẢN (VNĐ)</span>} required className="mb-6">
                        <Controller name="price" control={control} render={({ field }) => (
                          <InputNumber {...field} className="w-full rounded-lg border-gray-100 bg-gray-50 h-10 flex items-center text-base font-bold px-1 shadow-none" size="large" min={0} step={1000} formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} parser={(value) => value!.replace(/\$\s?|(,*)/g, "") as any} />
                        )} />
                      </Form.Item>
                      <Form.Item label={<span className="font-bold text-gray-700 text-[12px] px-1 tracking-tight">HÀNG TRONG KHO</span>} required className="mb-6">
                        <Controller name="stock" control={control} render={({ field }) => <InputNumber {...field} className="w-full rounded-lg border-gray-100 bg-gray-50 h-10 flex items-center text-base font-bold px-1 shadow-none" size="large" min={0} />} />
                      </Form.Item>
                    </div>

                    <div className="flex justify-between items-center mb-5 mt-4">
                       <span className="font-bold text-gray-700 text-[12px] px-1 uppercase tracking-tight">Tùy biến kích thước đặc biệt</span>
                       <Button size="small" variant="dashed" icon={<PlusOutlined />} onClick={() => append({ size: "", price: 0, stock: 0 })} className="h-7 text-[10px] font-bold rounded-md bg-white border-gray-100 text-emerald-600">THÊM BIẾN THỂ</Button>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {fields.map((field, index) => (
                        <div key={field.id} className="flex gap-3 p-4 border border-gray-50 rounded-xl bg-gray-50/50 hover:bg-white hover:border-emerald-100 transition-all group/item">
                          <Controller name={`variants.${index}.size`} control={control} render={({ field }) => <Input {...field} placeholder="Kích cỡ (vd: 15cm)" className="flex-1 rounded-md h-9 border-gray-100 text-xs font-bold" />} />
                          <Controller name={`variants.${index}.price`} control={control} render={({ field }) => <InputNumber {...field} placeholder="Giá riêng" className="flex-1 rounded-md h-9 border-gray-100 text-xs font-bold" formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} parser={(value) => value!.replace(/\$\s?|(,*)/g, "") as any} />} />
                          <Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => removeVariant(index)} className="flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>
                  </div>
              </div>

              <div id="section-media" className="scroll-mt-6 mb-24">
                  <div className={`p-8 rounded-[24px] border transition-all duration-500 bg-white ${activeSection === 'section-media' ? 'border-amber-200 shadow-xl shadow-amber-500/5' : 'border-transparent shadow-sm'}`}>
                    <h2 className="text-lg font-bold text-gray-900 mb-8">03. Nội dung & Hình ảnh</h2>
                    <div className="flex gap-6 items-start">
                      <Upload name="image" listType="picture-card" showUploadList={false} beforeUpload={handleUpload} className="studio-upload-v10">
                        {currentImageUrl ? (
                          <img src={currentImageUrl.startsWith("http") ? currentImageUrl : `${API_DOMAIN}${currentImageUrl}`} alt="cake" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full">
                            {isUploading ? <LoadingOutlined className="text-xl text-amber-500" /> : <PictureOutlined className="text-2xl text-gray-200" />}
                            <div className="mt-2 text-gray-300 font-bold text-[8px] tracking-widest uppercase">TẢI ẢNH</div>
                          </div>
                        )}
                      </Upload>
                      <div className="flex-1 space-y-4">
                        <Form.Item label={<span className="font-bold text-gray-700 text-[12px] px-1 tracking-tight">LIÊN KẾT HÌNH ÁNH DỰ PHÒNG</span>} className="mb-0">
                          <Controller name="image_url" control={control} render={({ field }) => <Input {...field} placeholder="https://cloud.com/image.jpg" className="rounded-lg h-9 bg-gray-50 border-gray-100 text-[11px] font-bold shadow-none focus:bg-white" />} />
                        </Form.Item>
                        <p className="text-[10px] text-gray-400 font-bold italic leading-relaxed">Ghi chú: Ảnh chính là yếu tố tiên quyết thu hút ánh nhìn đầu tiên của khách hàng.</p>
                      </div>
                    </div>

                    <Divider className="my-8 border-gray-50" />

                    <div className="flex justify-between items-center mb-5">
                        <span className="font-bold text-gray-700 text-[12px] px-1 uppercase tracking-tight">Kịch bản mô tả nhanh</span>
                        <div className="flex gap-1.5 flex-wrap justify-end max-w-[280px]">
                            {QUICK_PHRASES.map((phrase, idx) => (
                                <Tag
                                    key={idx}
                                    className="cursor-pointer bg-gray-50/50 hover:bg-amber-500 hover:text-white transition-all border border-gray-100 rounded-md text-[9px] py-1 px-3 font-bold text-gray-500 m-0"
                                    onClick={() => appendDescription(phrase)}
                                >
                                    {phrase}
                                </Tag>
                            ))}
                        </div>
                    </div>
                    
                    <Form.Item className="mb-0">
                      <Controller name="description" control={control} render={({ field }) => <Input.TextArea {...field} rows={5} placeholder="Chia sẻ câu chuyện hoặc quy trình làm nên chiếc bánh này..." className="rounded-xl bg-gray-50 border-none p-5 text-[14px] font-bold text-gray-700 focus:bg-white focus:ring-4 focus:ring-amber-500/5 transition-all shadow-none" />} />
                    </Form.Item>
                  </div>
              </div>

              <div id="section-attributes" className="scroll-mt-6">
                  <div className={`p-8 rounded-[24px] border transition-all duration-500 bg-white ${activeSection === 'section-attributes' ? 'border-purple-200 shadow-xl shadow-purple-500/5' : 'border-transparent shadow-sm'}`}>
                    <h2 className="text-lg font-bold text-gray-900 mb-8">04. Thông số kỹ thuật & Thẻ</h2>
                    <div className="grid grid-cols-2 gap-6">
                        <Form.Item label={<span className="font-bold text-gray-700 text-[12px] px-1 tracking-tight">KHỐI LƯỢNG TỊNH</span>} className="mb-6">
                        <Controller name="specifications.weight" control={control} render={({ field }) => <Input {...field} placeholder="vd: 500g" size="large" className="rounded-lg h-10 bg-gray-50 border-gray-100 font-bold text-xs shadow-none" />} />
                        </Form.Item>
                        <Form.Item label={<span className="font-bold text-gray-700 text-[12px] px-1 tracking-tight">QUY CÁCH PHỤC VỤ</span>} className="mb-6">
                        <Controller name="specifications.servings" control={control} render={({ field }) => <Input {...field} placeholder="vd: Dành cho 4-6 người" size="large" className="rounded-lg h-10 bg-gray-50 border-gray-100 font-bold text-xs shadow-none" />} />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <Form.Item label={<span className="font-bold text-gray-700 text-[12px] px-1 tracking-tight">NHÃN PHÂN LOẠI (TAGS)</span>} className="mb-0">
                        <Controller name="tags" control={control} render={({ field }) => (
                            <Select {...field} mode="tags" placeholder="Gắn nhãn..." size="large" className="rounded-lg w-full h-10 custom-studio-select-v4" />
                        )} />
                        </Form.Item>
                        <Form.Item label={<span className="font-bold text-gray-700 text-[12px] px-1 tracking-tight">NGUYÊN LIỆU NỔI BẬT</span>} className="mb-0">
                        <Controller name="ingredients" control={control} render={({ field }) => (
                            <Select {...field} mode="tags" placeholder="Thành phần chính..." size="large" className="rounded-lg w-full h-10 custom-studio-select-v4" />
                        )} />
                        </Form.Item>
                    </div>
                  </div>
              </div>
            </Form>
          </div>
        </main>

        <aside className="w-80 bg-white border-l border-gray-100 p-6 flex flex-col items-center shrink-0 overflow-y-auto">
          <div className="w-full flex justify-between items-center mb-8">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mobile Preview</span>
            <span className="flex items-center gap-1.5 text-indigo-500 text-[10px] font-bold bg-indigo-50 px-2 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" /> LIVE SYNC
            </span>
          </div>

          <div 
            onClick={() => setIsPreviewModalOpen(true)}
            className="w-full aspect-[1/1.6] rounded-[40px] border-[8px] border-gray-900 shadow-2xl relative overflow-hidden flex flex-col bg-white cursor-pointer hover:shadow-indigo-500/10 transition-all duration-500 group/phone"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-b-[14px] z-10" />
            
            <div className="flex-1 overflow-y-auto no-scrollbar">
               <div className="w-full aspect-square bg-gray-50 relative overflow-hidden">
                 {watchedValues.image_url ? (
                   <img src={watchedValues.image_url.startsWith("http") ? watchedValues.image_url : `${API_DOMAIN}${watchedValues.image_url}`} alt="preview" className="w-full h-full object-cover group-hover/phone:scale-105 transition-transform duration-700" />
                 ) : (
                   <div className="w-full h-full flex flex-col items-center justify-center text-gray-200">
                       <PictureOutlined className="text-3xl mb-2" />
                       <span className="text-[8px] font-bold uppercase tracking-widest">Awaiting Image</span>
                   </div>
                 )}
               </div>

               <div className="p-5 space-y-4">
                 <h4 className="text-sm font-bold text-gray-900 leading-tight">
                    {watchedValues.name || "Tên bánh của bạn"}
                 </h4>
                 <div className="text-indigo-600 font-bold text-lg">
                    {(watchedValues.price || 0).toLocaleString()} <span className="text-[11px] underline decoration-2">đ</span>
                 </div>
                 <p className="text-[11px] text-gray-500 leading-relaxed font-bold line-clamp-3">
                    {watchedValues.description || "Hãy bắt đầu nhập liệu, thông tin sẽ được cập nhật đồng bộ tại đây..."}
                 </p>
                 <div className="pt-2">
                    <div className="h-9 bg-gray-900 rounded-xl flex items-center justify-center text-white font-bold text-[10px] tracking-wide">
                        XEM CHI TIẾT SẢN PHẨM
                    </div>
                 </div>
               </div>
            </div>
          </div>
          <p className="mt-5 text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
             <EyeOutlined /> Click để xem bản lớn
          </p>
        </aside>
      </div>

      <style jsx global>{`
        .custom-studio-select-v4 .ant-select-selector {
            border-radius: 8px !important;
            background-color: #f9fafb !important;
            border: 1px solid #f3f4f6 !important;
            padding: 0 12px !important;
            font-weight: 700 !important;
            font-size: 13px !important;
            height: 100% !important;
            display: flex !important;
            align-items: center !important;
            box-shadow: none !important;
            transition: all 0.3s !important;
        }
        .custom-studio-select-v4.ant-select-focused .ant-select-selector {
            background-color: #ffffff !important;
            border-color: #e5e7eb !important;
            box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.05) !important;
        }
        .studio-upload-v10 .ant-upload.ant-upload-select {
          width: 100px !important;
          height: 100px !important;
          border-radius: 16px !important;
          background-color: #f9fafb !important;
          border: 2px dashed #f3f4f6 !important;
          transition: all 0.3s !important;
        }
        .studio-upload-v10 .ant-upload.ant-upload-select:hover {
          border-color: #fbbf24 !important;
          background-color: #fffbeb !important;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <Modal
        open={isPreviewModalOpen}
        onCancel={() => setIsPreviewModalOpen(false)}
        footer={null}
        width={1000}
        centered
        styles={{ body: { padding: 0, borderRadius: '32px', overflow: 'hidden' } }}
      >
        <div className="flex flex-col md:flex-row min-h-[600px]">
            <div className="md:w-1/2 bg-gray-50 relative">
                {watchedValues.image_url ? (
                    <img src={watchedValues.image_url.startsWith("http") ? watchedValues.image_url : `${API_DOMAIN}${watchedValues.image_url}`} alt="detail" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300 font-bold uppercase tracking-widest">No Image Provided</div>
                )}
                <div className="absolute top-6 left-6">
                    <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-sm">
                        <span className="text-indigo-600 font-bold text-xs">PREVIEW MODE</span>
                    </div>
                </div>
            </div>
            <div className="md:w-1/2 p-12 flex flex-col bg-white">
                <div className="flex-1">
                    <div className="flex gap-2 mb-8 flex-wrap">
                        {watchedValues.tags?.map((tag, i) => <Tag key={i} className="rounded-full px-4 py-0.5 font-bold bg-gray-100 text-gray-500 border-none uppercase text-[9px] tracking-widest">{tag}</Tag>)}
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tighter leading-tight">{watchedValues.name || "Tên sản phẩm"}</h1>
                    <div className="text-3xl font-bold text-indigo-600 mb-10 italic">{(watchedValues.price || 0).toLocaleString()} <span className="text-lg not-italic underline decoration-2">đ</span></div>
                    
                    <div className="space-y-10">
                        <div>
                            <h5 className="font-bold text-gray-400 text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span className="h-1 w-4 bg-indigo-500 rounded-full" /> MÔ TẢ TỪ NGHỆ NHÂN
                            </h5>
                            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed font-bold text-base">{watchedValues.description || "Nội dung mô tả sẽ hiển thị đầy đủ tại đây khi bạn nhập liệu bên ngoài Studio."}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-8 bg-gray-50/50 rounded-3xl border border-gray-100/50">
                                <h6 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Trọng lượng bánh</h6>
                                <p className="font-bold text-gray-800 text-lg">{watchedValues.specifications?.weight || "Chưa rõ"}</p>
                            </div>
                            <div className="p-8 bg-gray-50/50 rounded-3xl border border-gray-100/50">
                                <h6 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Khẩu phần ăn</h6>
                                <p className="font-bold text-gray-800 text-lg">{watchedValues.specifications?.servings || "Chưa rõ"}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <Button block type="primary" size="large" onClick={() => setIsPreviewModalOpen(false)} className="h-16 rounded-[20px] font-bold text-base bg-gray-900 mt-12 shadow-xl shadow-gray-200 border-none hover:bg-indigo-600 transition-all">TIẾP TỤC HOÀN THIỆN</Button>
            </div>
        </div>
      </Modal>
    </div>
  );
};
