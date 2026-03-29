"use client";

import React, { useState } from 'react';
import { Table, Tag, Space, Button, Modal, Form, Input, message, Rate, Avatar, Tooltip, Card, Typography, Divider } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, MessageOutlined, UserOutlined, CakeOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useReviewsQuery, useUpdateReviewStatusMutation, useReplyReviewMutation } from './hooks';

const { Title, Text, Paragraph } = Typography;

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
      if (error.statuscode === 422) message.error(error.message);
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
      if (error.statuscode === 422) message.error(error.message);
    }
  };

  const columns = [
    {
      title: 'Khách hàng',
      key: 'user',
      render: (_: any, record: any) => (
        <Space>
          <Avatar src={record.user.avatar} icon={<UserOutlined />} />
          <div>
            <div className="font-bold">{record.user.name}</div>
            <div className="text-xs text-gray-500">{record.user.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Sản phẩm',
      key: 'cake',
      render: (_: any, record: any) => (
        <Space>
          <Avatar shape="square" src={record.cake.image} icon={<CakeOutlined />} />
          <div className="text-xs max-w-[150px] truncate">{record.cake.name}</div>
        </Space>
      ),
    },
    {
      title: 'Đánh giá',
      key: 'rating',
      render: (_: any, record: any) => (
        <div>
          <Rate disabled defaultValue={record.rating} style={{ fontSize: 12 }} />
          <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'Xem thêm' }} className="mt-1 text-sm italic">
            \"{record.comment}\"
          </Paragraph>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_approved',
      key: 'is_approved',
      render: (approved: boolean) => (
        <Tag color={approved ? 'green' : 'orange'} icon={approved ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
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
            />
          </Tooltip>
          <Button 
            type="primary" 
            ghost 
            size="small"
            icon={<MessageOutlined />} 
            onClick={() => showReplyModal(record)}
          >
            Phản hồi
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card bordered={false} className="shadow-sm">
        <div className="mb-6">
          <Title level={3} style={{ margin: 0 }}>
            <MessageOutlined className="mr-2" />
            Quản lý Đánh giá
          </Title>
          <Text type="secondary">Theo dõi và phản hồi ý kiến từ khách hàng</Text>
        </div>

        <Divider className="my-4" />

        <Table 
          columns={columns} 
          dataSource={data?.items} 
          rowKey="id" 
          loading={isLoading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: data?.total,
            onChange: (page) => setPagination({ ...pagination, current: page }),
          }}
        />
      </Card>

      <Modal
        title="Phản hồi đánh giá"
        open={replyModalVisible}
        onCancel={() => setReplyModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={replyMutation.isPending}
        okText="Gửi phản hồi"
        cancelText="Hủy"
        centered
      >
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="font-bold text-gray-700 mb-1">{replyingReview?.user.name} đánh giá:</div>
          <Paragraph className="italic mb-0 text-gray-600">\"{replyingReview?.comment}\"</Paragraph>
        </div>
        <Form form={form} onFinish={handleReplySubmit} layout="vertical">
          <Form.Item 
            name="reply" 
            label="Nội dung phản hồi từ cửa hàng" 
            rules={[{ required: true, message: 'Vui lòng nhập nội dung phản hồi' }]}
          >
            <Input.TextArea rows={4} placeholder="Cảm ơn khách hàng hoặc giải đáp thắc mắc..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReviewModule;
