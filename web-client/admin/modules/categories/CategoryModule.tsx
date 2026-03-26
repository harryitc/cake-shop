'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { httpClient } from '@/lib/http';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
}

const CategoryModule = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();

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

  const handleAdd = () => {
    setEditingCategory(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: Category) => {
    setEditingCategory(record);
    form.setFieldsValue(record);
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

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingCategory) {
        await httpClient(`/categories/${editingCategory._id}`, {
          method: 'PUT',
          body: JSON.stringify(values),
        });
        message.success('Cập nhật danh mục thành công');
        setIsModalVisible(false);
        fetchCategories();
      } else {
        await httpClient('/categories', {
          method: 'POST',
          body: JSON.stringify(values),
        });
        message.success('Tạo danh mục thành công');
        setIsModalVisible(false);
        fetchCategories();
      }
    } catch (error: any) {
      message.error(error.message || 'Lỗi xử lý');
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
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
          >
            <Input placeholder="Ví dụ: Bánh sinh nhật" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea placeholder="Nhập mô tả danh mục" />
          </Form.Item>
          <Form.Item name="image_url" label="Link ảnh (Tùy chọn)">
            <Input placeholder="URL hình ảnh" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryModule;
