'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { httpClient } from '@/lib/http';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
}

const categorySchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên danh mục'),
  description: z.string().optional(),
  image_url: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

const CategoryModule = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset, formState: { errors, isDirty } } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', description: '', image_url: '' }
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await httpClient<Category[]>('/categories');
      setCategories(data);
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const handleEdit = (record: Category) => {
    setEditingCategory(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await httpClient(`/categories/${id}`, { method: 'DELETE' });
      message.success('Xóa danh mục thành công');
      fetchCategories();
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi xóa danh mục');
    }
  };

  const onSubmit = async (values: CategoryFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await httpClient(`/categories/${editingCategory._id}`, {
          method: 'PUT',
          body: JSON.stringify(values),
        });
        message.success('Cập nhật danh mục thành công');
      } else {
        await httpClient('/categories', {
          method: 'POST',
          body: JSON.stringify(values),
        });
        message.success('Tạo danh mục thành công');
      }
      setIsModalVisible(false);
      fetchCategories();
    } catch (error: any) {
      message.error(error.message || 'Lỗi xử lý');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Category) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>Sửa</Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa danh mục này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Danh mục</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm danh mục
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={categories}
        rowKey="_id"
        loading={loading}
      />

      <Modal
        title={editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
        open={isModalVisible}
        onOk={() => handleSubmit(onSubmit)()}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={isSubmitting}
        okButtonProps={{ disabled: !isDirty }}
        destroyOnClose
      >
        <Form layout="vertical" className="mt-4">
          <Form.Item
            label="Tên danh mục"
            validateStatus={errors.name ? 'error' : ''}
            help={errors.name?.message}
            required
          >
            <Controller
              name="name"
              control={control}
              render={({ field }) => <Input {...field} placeholder="Ví dụ: Bánh sinh nhật" />}
            />
          </Form.Item>
          <Form.Item label="Mô tả">
            <Controller
              name="description"
              control={control}
              render={({ field }) => <Input.TextArea {...field} placeholder="Nhập mô tả danh mục" />}
            />
          </Form.Item>
          <Form.Item label="Link ảnh (Tùy chọn)">
            <Controller
              name="image_url"
              control={control}
              render={({ field }) => <Input {...field} placeholder="URL hình ảnh" />}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryModule;
