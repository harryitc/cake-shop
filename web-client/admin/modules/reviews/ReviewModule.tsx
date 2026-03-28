'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, message, Space, Rate, Tag, Avatar, Tooltip, Modal, Input, Form } from 'antd';
import { CheckOutlined, CloseOutlined, UserOutlined, EyeOutlined, MessageOutlined, ExportOutlined } from '@ant-design/icons';
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
  reply?: string;
  repliedAt?: string;
  is_approved: boolean;
  createdAt: string;
}

const ReviewModule = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [replyingReview, setReplyingReview] = useState<Review | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

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

  const showReplyModal = (review: Review) => {
    setReplyingReview(review);
    form.setFieldsValue({ reply: review.reply || '' });
    setReplyModalVisible(true);
  };

  const handleReplySubmit = async (values: { reply: string }) => {
    if (!replyingReview) return;
    setSubmitting(true);
    try {
      await httpClient(`/reviews/admin/${replyingReview._id}/reply`, {
        method: 'PUT',
        body: JSON.stringify(values),
      });
      message.success('Gửi phản hồi thành công');
      setReplyModalVisible(false);
      fetchReviews(pagination.current);
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi gửi phản hồi');
    } finally {
      setSubmitting(false);
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
            <div className="font-bold whitespace-nowrap">{record.user?.full_name || record.user?.name || 'N/A'}</div>
            <div className="text-xs text-gray-400">{record.user?.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Sản phẩm',
      key: 'cake',
      render: (_: any, record: Review) => (
        <Space direction="vertical" size={0}>
          <Space>
            <img 
              src={record.cake?.image_url ? (record.cake.image_url.startsWith('http') ? record.cake.image_url : `${API_DOMAIN}${record.cake.image_url}`) : ''} 
              alt="cake" 
              className="w-8 h-8 rounded object-cover"
            />
            <span className="font-medium line-clamp-1">{record.cake?.name}</span>
          </Space>
          <Tooltip title="Xem sản phẩm ngoài trang chủ">
            <Button 
              type="link" 
              size="small" 
              icon={<ExportOutlined />} 
              className="p-0 text-xs h-auto mt-1"
              onClick={() => window.open(`http://localhost:3000/cakes/${record.cake?.slug || record.cake?._id}`, '_blank')}
            >
              Chi tiết sản phẩm
            </Button>
          </Tooltip>
        </Space>
      ),
      width: 220,
    },
    {
      title: 'Đánh giá & Phản hồi',
      key: 'rating',
      render: (_: any, record: Review) => (
        <div>
          <div className="flex items-center gap-2">
            <Rate disabled value={record.rating} className="text-[10px]" />
            <span className="text-[10px] text-gray-400">{new Date(record.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>
          <div className="text-gray-800 mt-1 mb-2 font-medium">"{record.comment || 'Không có bình luận'}"</div>
          
          {record.reply && (
            <div className="bg-blue-50 p-2 rounded-lg border border-blue-100 text-xs">
              <div className="font-bold text-blue-800 mb-1 flex justify-between">
                <span>Admin phản hồi:</span>
                <span className="text-[10px] text-blue-400 font-normal">{record.repliedAt ? new Date(record.repliedAt).toLocaleDateString('vi-VN') : ''}</span>
              </div>
              <div className="text-blue-700 italic">{record.reply}</div>
            </div>
          )}
        </div>
      ),
      width: 400,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_approved',
      key: 'status',
      render: (is_approved: boolean) => (
        <Tag color={is_approved ? 'success' : 'error'} className="rounded-full px-3">
          {is_approved ? 'Đã duyệt' : 'Đang ẩn'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Review) => (
        <Space size="small">
          <Tooltip title={record.is_approved ? "Ẩn đánh giá" : "Duyệt đánh giá"}>
            <Button 
              icon={record.is_approved ? <CloseOutlined /> : <CheckOutlined />} 
              onClick={() => handleToggleStatus(record._id, record.is_approved)}
              danger={record.is_approved}
              shape="circle"
              size="small"
              className={record.is_approved ? '' : 'border-green-500 text-green-500'}
            />
          </Tooltip>
          <Tooltip title="Phản hồi bình luận">
            <Button 
              icon={<MessageOutlined />} 
              onClick={() => showReplyModal(record)}
              type="primary"
              ghost
              shape="circle"
              size="small"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Quản lý Đánh giá</h1>
          <p className="text-gray-500 font-medium mt-1">Lắng nghe ý kiến của khách hàng và tương tác trực tiếp qua phản hồi.</p>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={reviews}
        rowKey="_id"
        loading={loading}
        pagination={{
          ...pagination,
          onChange: (page) => fetchReviews(page),
          showSizeChanger: false,
          position: ['bottomCenter']
        }}
        className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden"
      />

      <Modal
        title={
          <div className="flex items-center gap-2">
            <MessageOutlined className="text-blue-600" />
            <span>Phản hồi đánh giá của {replyingReview?.user?.full_name || replyingReview?.user?.name}</span>
          </div>
        }
        open={replyModalVisible}
        onCancel={() => setReplyModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        okText="Gửi phản hồi"
        cancelText="Hủy"
        destroyOnClose
        centered
        className="rounded-2xl"
      >
        <div className="py-4">
          <div className="mb-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="text-xs text-gray-400 mb-1">Nội dung đánh giá của khách:</div>
            <div className="font-medium text-gray-700 italic line-clamp-3">"{replyingReview?.comment}"</div>
          </div>
          
          <Form form={form} onFinish={handleReplySubmit} layout="vertical">
            <Form.Item 
              name="reply" 
              label={<span className="font-bold text-gray-700">Nội dung phản hồi của Admin</span>}
              rules={[{ required: true, message: 'Vui lòng nhập nội dung phản hồi' }]}
            >
              <Input.TextArea 
                placeholder="Cảm ơn khách hàng đã đánh giá sản phẩm của shop..." 
                rows={4} 
                className="rounded-xl border-gray-200 focus:border-blue-300 focus:shadow-[0_0_0_2px_rgba(59,130,246,0.1)] transition-all"
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default ReviewModule;
