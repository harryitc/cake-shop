'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Select, InputNumber, DatePicker, Tag, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, GiftOutlined } from '@ant-design/icons';
import { httpClient } from '@/lib/http';
import dayjs from 'dayjs';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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

const couponSchema = z.object({
  code: z.string().min(1, 'Vui lòng nhập mã'),
  type: z.enum(['PERCENT', 'FIXED']),
  value: z.number().min(0, 'Giá trị không được âm'),
  min_order_value: z.number().min(0).default(0),
  max_discount_value: z.number().min(0).nullable().optional(),
  start_date: z.any(),
  end_date: z.any(),
  usage_limit: z.number().min(1).nullable().optional(),
  is_active: z.boolean().default(true),
});

type CouponFormValues = z.infer<typeof couponSchema>;

const CouponModule = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset, formState: { errors, isDirty, isValid } } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    mode: 'onChange',
    defaultValues: {
      code: '',
      type: 'PERCENT',
      value: 0,
      min_order_value: 0,
      max_discount_value: null,
      start_date: dayjs(),
      end_date: dayjs().add(7, 'day'),
      usage_limit: null,
      is_active: true,
    }
  });

  const couponType = useWatch({ control, name: 'type' });

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

  useEffect(() => {
    if (isModalVisible) {
      if (editingCoupon) {
        reset({
          code: editingCoupon.code,
          type: editingCoupon.type,
          value: editingCoupon.value,
          min_order_value: editingCoupon.min_order_value,
          max_discount_value: editingCoupon.max_discount_value,
          start_date: dayjs(editingCoupon.start_date),
          end_date: dayjs(editingCoupon.end_date),
          usage_limit: editingCoupon.usage_limit,
          is_active: editingCoupon.is_active,
        });
      } else {
        reset({
          code: '',
          type: 'PERCENT',
          value: 0,
          min_order_value: 0,
          max_discount_value: null,
          start_date: dayjs(),
          end_date: dayjs().add(7, 'day'),
          usage_limit: null,
          is_active: true,
        });
      }
    }
  }, [isModalVisible, editingCoupon, reset]);

  const handleAdd = () => {
    setEditingCoupon(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record: Coupon) => {
    setEditingCoupon(record);
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

  const onSubmit = async (values: CouponFormValues) => {
    setIsSubmitting(true);
    try {
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
    } finally {
      setIsSubmitting(false);
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
        onOk={() => handleSubmit(onSubmit)()}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={isSubmitting}
        okButtonProps={{ disabled: !isDirty || !isValid }}
        destroyOnClose
        width={600}
      >
        <Form layout="vertical" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Mã giảm giá"
              validateStatus={errors.code ? 'error' : ''}
              help={errors.code?.message}
              required
            >
              <Controller
                name="code"
                control={control}
                render={({ field }) => <Input {...field} placeholder="Ví dụ: CAKE2024" className="uppercase" />}
              />
            </Form.Item>
            <Form.Item label="Loại giảm giá" required>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select {...field} options={[
                    { label: 'Phần trăm (%)', value: 'PERCENT' },
                    { label: 'Số tiền cố định (đ)', value: 'FIXED' },
                  ]} />
                )}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Giá trị giảm" required>
              <Controller
                name="value"
                control={control}
                render={({ field }) => (
                  <InputNumber 
                    {...field}
                    min={0} 
                    style={{ width: '100%' }} 
                    addonAfter={couponType === 'PERCENT' ? '%' : 'đ'}
                    formatter={couponType === 'FIXED' ? (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : undefined}
                    parser={couponType === 'FIXED' ? (value) => value!.replace(/\$\s?|(,*)/g, "") as any : undefined}
                  />
                )}
              />
            </Form.Item>
            <Form.Item label="Giá trị đơn hàng tối thiểu">
              <Controller
                name="min_order_value"
                control={control}
                render={({ field }) => (
                  <InputNumber 
                    {...field}
                    min={0} 
                    style={{ width: '100%' }} 
                    addonAfter="đ" 
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, "") as any}
                  />
                )}
              />
            </Form.Item>
          </div>

          {couponType === 'PERCENT' && (
            <Form.Item label="Giảm tối đa (Tùy chọn)">
              <Controller
                name="max_discount_value"
                control={control}
                render={({ field }) => (
                  <InputNumber 
                    {...field}
                    min={0} 
                    style={{ width: '100%' }} 
                    addonAfter="đ" 
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, "") as any}
                    value={field.value ?? undefined}
                  />
                )}
              />
            </Form.Item>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Ngày bắt đầu" required>
              <Controller
                name="start_date"
                control={control}
                render={({ field }) => <DatePicker {...field} style={{ width: '100%' }} showTime />}
              />
            </Form.Item>
            <Form.Item label="Ngày kết thúc" required>
              <Controller
                name="end_date"
                control={control}
                render={({ field }) => <DatePicker {...field} style={{ width: '100%' }} showTime />}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Giới hạn số lần dùng (Tùy chọn)">
              <Controller
                name="usage_limit"
                control={control}
                render={({ field }) => (
                  <InputNumber {...field} min={1} style={{ width: '100%' }} placeholder="Không giới hạn" value={field.value ?? undefined} />
                )}
              />
            </Form.Item>
            <Form.Item label="Trạng thái" valuePropName="checked">
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => <Switch {...field} checked={field.value} />}
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default CouponModule;
