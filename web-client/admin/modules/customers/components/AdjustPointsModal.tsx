"use client";

import React from "react";
import { Modal, Form, InputNumber, Input, message, App } from "antd";
import { useAdjustPointsMutation } from "../hooks";

interface AdjustPointsModalProps {
  userId: string;
  userName: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AdjustPointsModal: React.FC<AdjustPointsModalProps> = ({
  userId,
  userName,
  open,
  onClose,
  onSuccess,
}) => {
  const { message: msg } = App.useApp();
  const [form] = Form.useForm();
  const adjustMutation = useAdjustPointsMutation();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await adjustMutation.mutateAsync({ 
        userId, 
        points: values.points, 
        reason: values.reason 
      });
      msg.success("Điều chỉnh điểm thành công");
      form.resetFields();
      onSuccess?.();
      onClose();
    } catch (error: any) {
      if (error?.message) {
        msg.error(error.message);
      }
    }
  };

  return (
    <Modal
      title={`Điều chỉnh điểm: ${userName}`}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={adjustMutation.isPending}
      okText="Xác nhận"
      cancelText="Hủy"
      destroyOnClose
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
