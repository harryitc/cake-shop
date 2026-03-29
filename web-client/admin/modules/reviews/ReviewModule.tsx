"use client";

import React, { useState } from 'react';
import { Table, Tag, Space, Button, Modal, Form, Input, message, Rate, Avatar, Tooltip, Card, Typography, Divider } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, MessageOutlined, UserOutlined, CoffeeOutlined } from '@ant-design/icons';
import { useReviewsQuery, useUpdateReviewStatusMutation, useReplyReviewMutation } from './hooks';
import { getAvatarUrl, getImageUrl } from '@/lib/utils';

const { Title, Paragraph } = Typography;

const ReviewModule: React.FC = () => {
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [replyingReview, setReplyingReview] = useState<any | null>(null);
  const [form] = Form.useForm();

  const { data, isLoading } = useReviewsQuery(pagination.current, pagination.pageSize);
  const updateStatusMutation = useUpdateReviewStatusMutation();
  const replyMutation = useReplyReviewMutation();

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateStatusMutation.mutateAsync({ id, is_approved: !currentStatus });
      message.success(currentStatus ? 'Đã ẩn đánh giá' : 'Đã duyệt đánh giá');
    } catch (error: any) {
      message.error(error.message || 'Thao tác thất bại');
    }
  };

  const showReplyModal = (review: any) => {
    setReplyingReview(review);
    form.setFieldsValue({ reply: review.reply || '' });
    setReplyModalVisible(true);
  };

  const handleReplySubmit = async (values: { reply: string }) => {
    if (!replyingReview) return;
    try {
      await replyMutation.mutateAsync({ id: replyingReview.id, reply: values.reply });
      message.success('Gửi phản hồi thành công');
      setReplyModalVisible(false);
    } catch (error: any) {
      message.error(error.message || 'Gửi phản hồi thất bại');
    }
  };

  const columns = [
    {
      title: 'Khách hàng',
      key: 'user',
      render: (_: any, record: any) => (
        <Space>
          <Avatar src={getAvatarUrl(record.user.avatar)} icon={<UserOutlined />} className="border border-gray-100" />
          <div>
            <div className="font-bold text-gray-800">{record.user.name}</div>
            <div className="text-xs text-gray-400">{record.user.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Sản phẩm',
      key: 'cake',
      render: (_: any, record: any) => (
        <Space>
          <Avatar shape="square" src={getImageUrl(record.cake.image)} icon={<CoffeeOutlined />} className="border border-gray-100" />
          <div className="text-xs text-gray-600 max-w-[150px] truncate font-medium">{record.cake.name}</div>
        </Space>
      ),
    },
    {
      title: 'Đánh giá',
      key: 'rating',
      render: (_: any, record: any) => (
        <div>
          <Rate disabled value={record.rating} style={{ fontSize: 12 }} />
          <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'Xem thêm' }} className="mt-1 text-sm italic text-gray-500 mb-0">
            "{record.comment}"
          </Paragraph>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_approved',
      key: 'is_approved',
      render: (approved: boolean) => (
        <Tag color={approved ? 'green' : 'orange'} icon={approved ? <CheckCircleOutlined /> : <CloseCircleOutlined />} className="rounded-full px-2 text-[10px] font-black uppercase">
          {approved ? 'Đã duyệt' : 'Chờ duyệt'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Tooltip title={record.is_approved ? "Ẩn đánh giá" : "Duyệt đánh giá"}>
            <Button 
              type="text" 
              icon={record.is_approved ? <CloseCircleOutlined className="text-orange-500" /> : <CheckCircleOutlined className="text-green-500" />} 
              onClick={() => handleToggleStatus(record.id, record.is_approved)}
              className="hover:bg-gray-100 rounded-lg"
            />
          </Tooltip>
          <Button 
            type="primary" 
            ghost 
            size="small"
            icon={<MessageOutlined />} 
            onClick={() => showReplyModal(record)}
            className="rounded-lg font-bold text-xs"
          >
            {record.reply ? 'Sửa phản hồi' : 'Phản hồi'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card bordered={false} className="shadow-sm border border-gray-100">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <Title level={3} style={{ margin: 0 }} className="font-black tracking-tight">
              <MessageOutlined className="mr-2 text-indigo-600" />
              Quản lý Đánh giá
            </Title>
            <Typography.Text type="secondary" className="font-medium text-gray-400">Theo dõi và phản hồi ý kiến từ khách hàng trên hệ thống</Typography.Text>
          </div>
        </div>

        <Divider className="my-4 border-gray-50" />

        <Table 
          columns={columns} 
          dataSource={data?.items} 
          rowKey="id" 
          loading={isLoading}
          className="review-table"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: data?.total,
            showTotal: (total) => `Tổng cộng ${total} đánh giá`,
            onChange: (page) => setPagination({ ...pagination, current: page }),
          }}
        />
      </Card>

      <Modal
        title={<span className="font-black text-gray-800">Phản hồi đánh giá</span>}
        open={replyModalVisible}
        onCancel={() => setReplyModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={replyMutation.isPending}
        okText="Gửi phản hồi"
        cancelText="Hủy"
        centered
        className="rounded-2xl overflow-hidden"
      >
        <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="font-black text-indigo-600 text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
            <UserOutlined /> {replyingReview?.user?.name} đánh giá:
          </div>
          <Paragraph className="italic mb-0 text-gray-600 text-sm leading-relaxed font-medium">"{replyingReview?.comment}"</Paragraph>
        </div>
        <Form form={form} onFinish={handleReplySubmit} layout="vertical">
          <Form.Item 
            name="reply" 
            label={<span className="font-bold text-gray-500 text-xs uppercase tracking-wider">Nội dung phản hồi từ cửa hàng</span>} 
            rules={[{ required: true, message: 'Vui lòng nhập nội dung phản hồi' }]}
          >
            <Input.TextArea rows={4} placeholder="Cảm ơn khách hàng hoặc giải đáp thắc mắc..." className="rounded-xl border-gray-200 focus:border-indigo-500 transition-all" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReviewModule;
