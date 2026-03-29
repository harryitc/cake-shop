"use client";

import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm, Tag, Image, Card, Typography, Divider, Select, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FolderOpenOutlined, StarFilled, StarOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation } from './hooks';
import { getImageUrl } from '@/lib/utils';

const { Title, Text } = Typography;
const { Option } = Select;

const categorySchema = z.object({
  name: z.string().min(2, 'Tên danh mục phải có ít nhất 2 ký tự'),
  description: z.string().optional(),
  image_url: z.string().optional().or(z.literal('')),
  type: z.enum(['OCCASION', 'FLAVOR', 'DIET', 'OTHER']).default('OTHER'),
  is_featured: z.boolean().default(false),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

const CategoryModule: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  const { data: categories, isLoading } = useCategoriesQuery();
  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();
  const deleteMutation = useDeleteCategoryMutation();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: { name: '', description: '', image_url: '', type: 'OTHER', is_featured: false }
  });

  useEffect(() => {
    if (isModalVisible) {
      if (editingCategory) {
        reset({
          name: editingCategory.name,
          description: editingCategory.description || '',
          image_url: editingCategory.image_url || '',
          type: editingCategory.type || 'OTHER',
          is_featured: editingCategory.is_featured || false,
        });
      } else {
        reset({ name: '', description: '', image_url: '', type: 'OTHER', is_featured: false });
      }
    }
  }, [isModalVisible, editingCategory, reset]);

  const handleAdd = () => {
    setEditingCategory(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditingCategory(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('Xóa danh mục thành công');
    } catch (error: any) {
      if (error.statuscode === 422 || error.statuscode === 409) {
        message.error(error.message);
      }
    }
  };

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({ id: editingCategory.id, data: values });
        message.success('Cập nhật danh mục thành công');
      } else {
        await createMutation.mutateAsync(values);
        message.success('Tạo danh mục thành công');
      }
      setIsModalVisible(false);
    } catch (error: any) {
      if (error.statuscode === 422 || error.statuscode === 409) {
        message.error(error.message);
      }
    }
  };

  const getCategoryTypeTag = (type: string) => {
    switch (type) {
      case 'OCCASION': return <Tag color="blue">Dịp lễ</Tag>;
      case 'FLAVOR': return <Tag color="orange">Hương vị</Tag>;
      case 'DIET': return <Tag color="green">Chế độ ăn</Tag>;
      default: return <Tag color="default">Khác</Tag>;
    }
  };

  const columns = [
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Space>
          {record.is_featured ? <StarFilled style={{ color: '#fadb14' }} /> : <StarOutlined style={{ color: '#d9d9d9' }} />}
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Phân loại',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => getCategoryTypeTag(type),
    },
    {
      title: 'Ảnh',
      dataIndex: 'image_url',
      key: 'image_url',
      render: (url: string) => (
        <Image
          src={getImageUrl(url)}
          fallback="https://placehold.co/100x100?text=No+Img"
          alt="category"
          width={40}
          height={40}
          className="rounded-lg object-cover border border-gray-100"
        />
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => <span className="text-gray-400 text-xs">{text || "Chưa có mô tả"}</span>
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: '#1890ff' }} />}
            onClick={() => handleEdit(record)}
            className="hover:bg-blue-50"
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa danh mục này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              className="hover:bg-red-50"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card bordered={false} className="shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Title level={3} style={{ margin: 0 }} className="font-black tracking-tight">
              <FolderOpenOutlined className="mr-2 text-indigo-600" />
              Quản lý danh mục
            </Title>
            <Text type="secondary" className="font-medium text-gray-400">Quản lý các nhóm sản phẩm bánh của cửa hàng</Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            size="large"
            className="rounded-xl h-11 px-6 bg-black hover:bg-gray-800 border-none shadow-lg shadow-gray-200"
          >
            Thêm danh mục
          </Button>
        </div>

        <Divider className="my-4 border-gray-50" />

        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          className="ant-table-custom"
        />
      </Card>

      <Modal
        title={<span className="font-black text-gray-800">{editingCategory ? "Cập nhật danh mục" : "Thêm danh mục mới"}</span>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSubmit(onSubmit)}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText={editingCategory ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
        destroyOnClose
        centered
        width={500}
        className="rounded-2xl overflow-hidden"
      >
        <Form layout="vertical" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item label={<span className="font-bold text-gray-500 text-xs uppercase tracking-wider">Tên danh mục</span>} required validateStatus={errors.name ? 'error' : ''} help={errors.name?.message}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => <Input {...field} placeholder="VD: Bánh kem sinh nhật" size="large" className="rounded-xl border-gray-200 focus:border-indigo-500" />}
              />
            </Form.Item>

            <Form.Item label={<span className="font-bold text-gray-500 text-xs uppercase tracking-wider">Phân loại</span>} required>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select {...field} size="large" className="rounded-xl border-gray-200">
                    <Option value="OCCASION">Dịp lễ (Occasion)</Option>
                    <Option value="FLAVOR">Hương vị (Flavor)</Option>
                    <Option value="DIET">Chế độ ăn (Diet)</Option>
                    <Option value="OTHER">Khác (Other)</Option>
                  </Select>
                )}
              />
            </Form.Item>
          </div>

          <Form.Item label={<span className="font-bold text-gray-500 text-xs uppercase tracking-wider">Mô tả</span>} validateStatus={errors.description ? 'error' : ''} help={errors.description?.message}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => <Input.TextArea {...field} placeholder="Mô tả ngắn về danh mục" rows={3} className="rounded-xl border-gray-200 focus:border-indigo-500" />}
            />
          </Form.Item>

          <Form.Item label={<span className="font-bold text-gray-500 text-xs uppercase tracking-wider">Link ảnh đại diện</span>} validateStatus={errors.image_url ? 'error' : ''} help={errors.image_url?.message}>
            <Controller
              name="image_url"
              control={control}
              render={({ field }) => <Input {...field} placeholder="https://example.com/image.jpg hoặc /uploads/..." size="large" className="rounded-xl border-gray-200 focus:border-indigo-500" />}
            />
          </Form.Item>

          <Form.Item label={<span className="font-bold text-gray-500 text-xs uppercase tracking-wider">Hiển thị nổi bật</span>} valuePropName="checked">
            <Controller
              name="is_featured"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <Switch checked={field.value} onChange={field.onChange} />
                  <span className="text-xs text-gray-400 font-medium">Đánh dấu để hiện danh mục này tại các vị trí ưu tiên</span>
                </div>
              )}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryModule;
