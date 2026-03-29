"use client";

import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm, Tag, Image, Card, Typography, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Category } from './types';
import { useCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation } from './hooks';

const { Title, Text } = Typography;

const categorySchema = z.object({
  name: z.string().min(2, 'Tên danh mục phải có ít nhất 2 ký tự'),
  description: z.string().optional(),
  image_url: z.string().url('Link ảnh không hợp lệ').or(z.literal('')),
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
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', description: '', image_url: '' }
  });

  useEffect(() => {
    if (isModalVisible) {
      if (editingCategory) {
        reset({
          name: editingCategory.name,
          description: editingCategory.description || '',
          image_url: editingCategory.image_url || '',
        });
      } else {
        reset({ name: '', description: '', image_url: '' });
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
      // Chỉ hiện message lỗi nghiệp vụ (Local error)
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

  const columns = [
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Ảnh',
      dataIndex: 'image_url',
      key: 'image_url',
      render: (url: string) => url ? <Image src={url} alt="category" width={50} height={50} className="rounded object-cover" /> : <Tag color="default">Không có ảnh</Tag>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined style={{ color: '#1890ff' }} />} 
            onClick={() => handleEdit(record)}
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
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card bordered={false} className="shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Title level={3} style={{ margin: 0 }}>
              <FolderOpenOutlined className="mr-2" />
              Quản lý danh mục
            </Title>
            <Text type="secondary">Quản lý các nhóm sản phẩm bánh của cửa hàng</Text>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAdd}
            size="large"
            className="rounded-lg h-11 px-6 bg-black hover:bg-gray-800 border-none"
          >
            Thêm danh mục
          </Button>
        </div>

        <Divider className="my-4" />

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
        title={editingCategory ? "Cập nhật danh mục" : "Thêm danh mục mới"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSubmit(onSubmit)}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText={editingCategory ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
        destroyOnClose
        centered
        width={500}
      >
        <Form layout="vertical" className="mt-4">
          <Form.Item label="Tên danh mục" required validateStatus={errors.name ? 'error' : ''} help={errors.name?.message}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => <Input {...field} placeholder="VD: Bánh kem sinh nhật" size="large" />}
            />
          </Form.Item>

          <Form.Item label="Mô tả" validateStatus={errors.description ? 'error' : ''} help={errors.description?.message}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => <Input.TextArea {...field} placeholder="Mô tả ngắn về danh mục" rows={3} />}
            />
          </Form.Item>

          <Form.Item label="Link ảnh" validateStatus={errors.image_url ? 'error' : ''} help={errors.image_url?.message}>
            <Controller
              name="image_url"
              control={control}
              render={({ field }) => <Input {...field} placeholder="https://example.com/image.jpg" size="large" />}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryModule;
