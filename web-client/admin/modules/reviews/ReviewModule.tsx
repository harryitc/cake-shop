'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, message, Space, Rate, Tag, Avatar, Tooltip } from 'antd';
import { CheckOutlined, CloseOutlined, UserOutlined, EyeOutlined } from '@ant-design/icons';
import { httpClient } from '@/lib/http';
import { API_DOMAIN } from "@/lib/configs";


interface Review {
  _id: string;
  user: {
    _id: string;
    full_name: string;
    name: string;
    email: string;
  };
  cake: {
    _id: string;
    name: string;
    slug: string;
    image_url: string;
  };
  rating: number;
  comment: string;
  is_approved: boolean;
  createdAt: string;
}

const ReviewModule = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const fetchReviews = async (page = 1) => {
    setLoading(true);
    try {
      const data = await httpClient<any>(`/reviews/admin?page=${page}&limit=${pagination.pageSize}`);
      setReviews(data.items);
      setPagination({ ...pagination, current: data.page, total: data.total });
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await httpClient(`/reviews/admin/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ is_approved: !currentStatus }),
      });
      message.success(currentStatus ? 'Đã ẩn đánh giá' : 'Đã duyệt đánh giá');
      fetchReviews(pagination.current);
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  const columns = [
    {
      title: 'Khách hàng',
      key: 'user',
      render: (_: any, record: Review) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div className="font-bold">{record.user?.full_name || record.user?.name || 'N/A'}</div>
            <div className="text-xs text-gray-400">{record.user?.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Sản phẩm',
      key: 'cake',
      render: (_: any, record: Review) => (
        <Space>
          <img 
            src={record.cake?.image_url ? (record.cake.image_url.startsWith('http') ? record.cake.image_url : `${API_DOMAIN}${record.cake.image_url}`) : ''} 
            alt="cake" 
            className="w-8 h-8 rounded object-cover"
          />
          <span className="font-medium">{record.cake?.name}</span>
        </Space>
      ),
    },
    {
      title: 'Đánh giá',
      key: 'rating',
      render: (_: any, record: Review) => (
        <div>
          <Rate disabled value={record.rating} className="text-xs" />
          <div className="text-gray-600 mt-1 italic">"{record.comment || 'Không có bình luận'}"</div>
        </div>
      ),
      width: 300,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_approved',
      key: 'status',
      render: (is_approved: boolean) => (
        <Tag color={is_approved ? 'success' : 'error'}>
          {is_approved ? 'Đã duyệt' : 'Đang ẩn'}
        </Tag>
      ),
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Review) => (
        <Space size="middle">
          <Tooltip title={record.is_approved ? "Ẩn đánh giá" : "Duyệt đánh giá"}>
            <Button 
              icon={record.is_approved ? <CloseOutlined /> : <CheckOutlined />} 
              onClick={() => handleToggleStatus(record._id, record.is_approved)}
              danger={record.is_approved}
              type="primary"
              ghost
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Đánh giá & Phản hồi</h1>
        <p className="text-gray-500">Xem và kiểm duyệt các đánh giá từ khách hàng để đảm bảo chất lượng nội dung.</p>
      </div>

      <Table
        columns={columns}
        dataSource={reviews}
        rowKey="_id"
        loading={loading}
        pagination={{
          ...pagination,
          onChange: (page) => fetchReviews(page),
        }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      />
    </div>
  );
};

export default ReviewModule;
