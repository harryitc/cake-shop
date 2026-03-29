"use client";

import React, { useState } from "react";
import { Modal, Form, InputNumber, Input, message } from "antd";
import { customersService } from "../api";

interface AdjustPointsModalProps {
  userId: string;
  userName: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AdjustPointsModal: React.FC<AdjustPointsModalProps> = ({
  userId,
  userName,
  open,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await customersService.adjustPoints(userId, values.points, values.reason);
      message.success("Điều chỉnh điểm thành công");
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(error.message || "Điều chỉnh điểm thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Điều chỉnh điểm: ${userName}`}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={loading}
      okText="Xác nhận"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="points"
          label="Số điểm thay đổi"
          rules={[{ required: true, message: "Vui lòng nhập số điểm" }]}
        >
          <InputNumber 
            style={{ width: "100%" }} 
            placeholder="Ví dụ: 100 hoặc -100" 
          />
        </Form.Item>
        <Form.Item
          name="reason"
          label="Lý do"
          rules={[{ required: true, message: "Vui lòng nhập lý do" }]}
        >
          <Input.TextArea placeholder="Nhập lý do điều chỉnh điểm" rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AdjustPointsModal;
