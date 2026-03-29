"use client";

import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Select, DatePicker, Switch, message, Popconfirm, Card, Typography, Divider, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, GiftOutlined } from '@ant-design/icons';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import dayjs from 'dayjs';
import { useCouponsQuery, useCreateCouponMutation, useUpdateCouponMutation, useDeleteCouponMutation } from './hooks';
import { useCategoriesQuery } from '../categories/hooks';

const { Title, Text } = Typography;
const { Option } = Select;

const couponSchema = z.object({
  code: z.string().min(3, 'Mã phải có ít nhất 3 ký tự').toUpperCase(),
  description: z.string().optional(),
  discount_type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  discount_value: z.number().min(1, 'Giá trị giảm phải lớn hơn 0'),
  min_order_value: z.number().default(0),
  max_discount_value: z.number().optional(),
  start_date: z.any(),
  end_date: z.any(),
  usage_limit: z.number({ required_error: "Vui lòng nhập tổng lượt dùng", invalid_type_error: "Vui lòng nhập số"}).min(1, 'Giới hạn sử dụng phải ít nhất là 1'),
  usage_limit_per_user: z.number({ required_error: "Vui lòng nhập giới hạn cho mỗi người dùng", invalid_type_error: "Vui lòng nhập số"}).min(1, 'Giới hạn mỗi người dùng phải ít nhất là 1'),
  applicable_categories: z.array(z.string()).optional(),
  is_active: z.boolean().default(true),
});

type CouponFormValues = z.infer<typeof couponSchema>;

const CouponModule: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any | null>(null);

  const { data: coupons, isLoading } = useCouponsQuery();
  const { data: categories } = useCategoriesQuery();
  
  const createMutation = useCreateCouponMutation();
  const updateMutation = useUpdateCouponMutation();
  const deleteMutation = useDeleteCouponMutation();

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema) as any,
    defaultValues: {
      code: '',
      discount_type: 'PERCENTAGE',
      discount_value: 0,
      min_order_value: 0,
      usage_limit: 100,
      usage_limit_per_user: 1,
      applicable_categories: [],
      is_active: true,
    }
  });

  const discountType = useWatch({ control, name: 'discount_type' });

  useEffect(() => {
    if (isModalVisible) {
      if (editingCoupon) {
        reset({
          ...editingCoupon,
          start_date: dayjs(editingCoupon.start_date),
          end_date: dayjs(editingCoupon.end_date),
        });
      } else {
        reset({
          code: '',
          discount_type: 'PERCENTAGE',
          discount_value: 0,
          min_order_value: 0,
          usage_limit: 100,
          usage_limit_per_user: 1,
          applicable_categories: [],
          is_active: true,
          start_date: dayjs(),
          end_date: dayjs().add(1, 'month'),
        });
      }
    }
  }, [isModalVisible, editingCoupon, reset]);

  const handleAdd = () => {
    setEditingCoupon(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditingCoupon(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('Xóa mã giảm giá thành công');
    } catch (error: any) {
      if (error.statuscode === 422 || error.statuscode === 409) {
        message.error(error.message);
      }
    }
  };

  const onSubmit = async (values: CouponFormValues) => {
    const formattedValues = {
      ...values,
      type: values.discount_type === 'PERCENTAGE' ? 'PERCENT' : 'FIXED',
      value: values.discount_value,
      start_date: values.start_date.toISOString(),
      end_date: values.end_date.toISOString(),
    };

    // Remove UI-only fields before sending to API
    delete (formattedValues as any).discount_type;
    delete (formattedValues as any).discount_value;

    try {
      if (editingCoupon) {
        await updateMutation.mutateAsync({ id: editingCoupon.id, data: formattedValues });
        message.success('Cập nhật thành công');
      } else {
        await createMutation.mutateAsync(formattedValues);
        message.success('Tạo mã thành công');
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
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      render: (text: string) => <Tag color="blue" className="font-mono font-bold text-sm">{text}</Tag>,
    },
    {
      title: 'Loại giảm',
      dataIndex: 'discount_type',
      key: 'discount_type',
      render: (type: string, record: any) => {
        const val = record.discount_value || 0;
        return (
          <span>
            {type === 'PERCENTAGE' ? `${val}%` : `${val.toLocaleString()}đ`}
          </span>
        );
      },
    },
    {
      title: 'Đã dùng',
      key: 'usage',
      render: (_: any, record: any) => (
        <span>{record.used_count} / {record.usage_limit}</span>
      ),
    },
    {
      title: 'Hạn dùng',
      key: 'date',
      render: (_: any, record: any) => (
        <span className="text-xs">
          {dayjs(record.start_date).format('DD/MM')} - {dayjs(record.end_date).format('DD/MM/YYYY')}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean) => <Tag color={active ? 'green' : 'red'}>{active ? 'Bật' : 'Tắt'}</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined style={{ color: '#1890ff' }} />} onClick={() => handleEdit(record)} />
          <Popconfirm title="Xóa mã này?" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
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
              <GiftOutlined className="mr-2" />
              Chương trình giảm giá
            </Title>
            <Text type="secondary">Quản lý mã khuyến mãi và ưu đãi khách hàng</Text>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAdd}
            size="large"
            className="rounded-lg h-11 px-6 bg-black hover:bg-gray-800 border-none"
          >
            Tạo mã mới
          </Button>
        </div>

        <Divider className="my-4" />

        <Table 
          columns={columns} 
          dataSource={coupons} 
          rowKey="id" 
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingCoupon ? "Cập nhật mã giảm giá" : "Tạo mã giảm giá mới"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSubmit(onSubmit)}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={600}
        centered
      >
        <Form layout="vertical" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Mã giảm giá (Code)" required help={errors.code?.message} validateStatus={errors.code ? 'error' : ''}>
              <Controller
                name="code"
                control={control}
                render={({ field }) => <Input {...field} placeholder="VD: KM50" size="large" />}
              />
            </Form.Item>

            <Form.Item label="Loại giảm giá" required>
              <Controller
                name="discount_type"
                control={control}
                render={({ field }) => (
                  <Select {...field} size="large">
                    <Option value="PERCENTAGE">Phần trăm (%)</Option>
                    <Option value="FIXED_AMOUNT">Số tiền cố định (đ)</Option>
                  </Select>
                )}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Giá trị giảm" required help={errors.discount_value?.message} validateStatus={errors.discount_value ? 'error' : ''}>
              <Controller
                name="discount_value"
                control={control}
                render={({ field }) => <InputNumber {...field} min={0} className="w-full" size="large" />}
              />
            </Form.Item>

            <Form.Item label="Giảm tối đa (VNĐ)" help={errors.max_discount_value?.message}>
              <Controller
                name="max_discount_value"
                control={control}
                render={({ field }) => <InputNumber {...field} min={0} className="w-full" size="large" placeholder="Để trống nếu không giới hạn" />}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Đơn hàng tối thiểu" required help={errors.min_order_value?.message} validateStatus={errors.min_order_value ? 'error' : ''}>
              <Controller
                name="min_order_value"
                control={control}
                render={({ field }) => <InputNumber {...field} min={0} className="w-full" size="large" />}
              />
            </Form.Item>

            <Form.Item label="Tổng lượt dùng" required help={errors.usage_limit?.message || "Số lượng mã phát ra (VD: 100 người đầu tiên)"} validateStatus={errors.usage_limit ? 'error' : ''}>
              <Controller
                name="usage_limit"
                control={control}
                render={({ field }) => <InputNumber {...field} min={1} className="w-full" size="large" />}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Giới hạn mỗi người dùng" required help={errors.usage_limit_per_user?.message || "Một người được dùng mã này bao nhiêu lần?"} validateStatus={errors.usage_limit_per_user ? 'error' : ''}>
              <Controller
                name="usage_limit_per_user"
                control={control}
                render={({ field }) => <InputNumber {...field} min={1} className="w-full" size="large" />}
              />
            </Form.Item>

            <Form.Item label="Trạng thái kích hoạt">
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <div className="h-[40px] flex items-center">
                    <Switch checked={field.value} onChange={field.onChange} />
                    <span className="ml-2 text-gray-500 text-xs">{field.value ? 'Đang bật' : 'Đang tắt'}</span>
                  </div>
                )}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Ngày bắt đầu" required>
              <Controller
                name="start_date"
                control={control}
                render={({ field }) => <DatePicker {...field} className="w-full" size="large" format="DD/MM/YYYY" />}
              />
            </Form.Item>

            <Form.Item label="Ngày kết thúc" required>
              <Controller
                name="end_date"
                control={control}
                render={({ field }) => <DatePicker {...field} className="w-full" size="large" format="DD/MM/YYYY" />}
              />
            </Form.Item>
          </div>

          <Form.Item label="Danh mục áp dụng">
            <Controller
              name="applicable_categories"
              control={control}
              render={({ field }) => (
                <Select {...field} mode="multiple" placeholder="Chọn các danh mục (để trống nếu áp dụng tất cả)" size="large">
                  {categories?.map((cat: any) => (
                    <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item label="Mô tả" help={errors.description?.message} className="mb-0">
            <Controller
              name="description"
              control={control}
              render={({ field }) => <Input.TextArea {...field} rows={2} placeholder="Mô tả ngắn gọn về ưu đãi" />}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CouponModule;
