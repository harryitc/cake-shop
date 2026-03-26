'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Select, InputNumber, DatePicker, Tag, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, GiftOutlined } from '@ant-design/icons';
import { httpClient } from '@/lib/http';
import dayjs from 'dayjs';

interface Coupon {
  _id: string;
  code: string;
  type: 'PERCENT' | 'FIXED';
  value: number;
  min_order_value: number;
  max_discount_value: number | null;
  start_date: string;
  end_date: string;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
}

const CouponModule = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [form] = Form.useForm();
  const couponType = Form.useWatch('type', form);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const data = await httpClient<Coupon[]>('/coupons');
      setCoupons(data);
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi tải danh sách mã giảm giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleAdd = () => {
    setEditingCoupon(null);
    form.resetFields();
    form.setFieldsValue({
      type: 'PERCENT',
      is_active: true,
      start_date: dayjs(),
      end_date: dayjs().add(7, 'day'),
    });
    setIsModalVisible(true);
  };

  const handleEdit = (record: Coupon) => {
    setEditingCoupon(record);
    form.setFieldsValue({
      ...record,
      start_date: dayjs(record.start_date),
      end_date: dayjs(record.end_date),
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await httpClient(`/coupons/${id}`, { method: 'DELETE' });
      message.success('Xóa mã giảm giá thành công');
      fetchCoupons();
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi xóa mã giảm giá');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = {
        ...values,
        start_date: values.start_date.toISOString(),
        end_date: values.end_date.toISOString(),
      };

      if (editingCoupon) {
        await httpClient(`/coupons/${editingCoupon._id}`, {
          method: 'PUT',
          body: JSON.stringify(formattedValues),
        });
        message.success('Cập nhật mã giảm giá thành công');
      } else {
        await httpClient('/coupons', {
          method: 'POST',
          body: JSON.stringify(formattedValues),
        });
        message.success('Tạo mã giảm giá thành công');
      }
      setIsModalVisible(false);
      fetchCoupons();
    } catch (error: any) {
      message.error(error.message || 'Lỗi xử lý');
    }
  };

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => <Tag color="blue" className="font-mono font-bold">{code}</Tag>
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'PERCENT' ? 'green' : 'orange'}>
          {type === 'PERCENT' ? 'Phần trăm' : 'Cố định'}
        </Tag>
      )
    },
    {
      title: 'Giá trị',
      dataIndex: 'value',
      key: 'value',
      render: (value: number, record: Coupon) => (
        <span>{record.type === 'PERCENT' ? `${value}%` : `${value.toLocaleString()}đ`}</span>
      )
    },
    {
      title: 'Đơn tối thiểu',
      dataIndex: 'min_order_value',
      key: 'min_order_value',
      render: (val: number) => `${val.toLocaleString()}đ`
    },
    {
      title: 'Thời gian',
      key: 'duration',
      render: (_: any, record: Coupon) => (
        <div className="text-xs">
          <div>Từ: {dayjs(record.start_date).format('DD/MM/YYYY')}</div>
          <div>Đến: {dayjs(record.end_date).format('DD/MM/YYYY')}</div>
        </div>
      )
    },
    {
      title: 'Sử dụng',
      key: 'usage',
      render: (_: any, record: Coupon) => (
        <span>{record.used_count} / {record.usage_limit || '∞'}</span>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean) => (
        <Tag color={active ? 'success' : 'error'}>
          {active ? 'Hoạt động' : 'Tắt'}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Coupon) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>Sửa</Button>
          <Popconfirm
            title="Xóa mã giảm giá này?"
            onConfirm={() => handleDelete(record._id)}
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
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GiftOutlined /> Quản lý Mã giảm giá
        </h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Tạo mã mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={coupons}
        rowKey="_id"
        loading={loading}
      />

      <Modal
        title={editingCoupon ? 'Sửa mã giảm giá' : 'Tạo mã giảm giá mới'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="code"
              label="Mã giảm giá"
              rules={[{ required: true, message: 'Vui lòng nhập mã' }]}
            >
              <Input placeholder="Ví dụ: CAKE2024" className="uppercase" />
            </Form.Item>
            <Form.Item
              name="type"
              label="Loại giảm giá"
              rules={[{ required: true }]}
            >
              <Select options={[
                { label: 'Phần trăm (%)', value: 'PERCENT' },
                { label: 'Số tiền cố định (đ)', value: 'FIXED' },
              ]} />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="value"
              label="Giá trị giảm"
              rules={[{ required: true, message: 'Vui lòng nhập giá trị' }]}
            >
              <InputNumber 
                min={0} 
                style={{ width: '100%' }} 
                addonAfter={couponType === 'PERCENT' ? '%' : 'đ'}
              />
            </Form.Item>
            <Form.Item
              name="min_order_value"
              label="Giá trị đơn hàng tối thiểu"
              initialValue={0}
            >
              <InputNumber min={0} style={{ width: '100%' }} addonAfter="đ" />
            </Form.Item>
          </div>

          {couponType === 'PERCENT' && (
            <Form.Item
              name="max_discount_value"
              label="Giảm tối đa (Tùy chọn)"
            >
              <InputNumber min={0} style={{ width: '100%' }} addonAfter="đ" />
            </Form.Item>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="start_date"
              label="Ngày bắt đầu"
              rules={[{ required: true }]}
            >
              <DatePicker style={{ width: '100%' }} showTime />
            </Form.Item>
            <Form.Item
              name="end_date"
              label="Ngày kết thúc"
              rules={[{ required: true }]}
            >
              <DatePicker style={{ width: '100%' }} showTime />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="usage_limit"
              label="Giới hạn số lần dùng (Tùy chọn)"
            >
              <InputNumber min={1} style={{ width: '100%' }} placeholder="Không giới hạn" />
            </Form.Item>
            <Form.Item
              name="is_active"
              label="Trạng thái"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default CouponModule;
