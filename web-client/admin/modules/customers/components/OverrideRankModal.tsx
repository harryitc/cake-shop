"use client";

import React, { useState, useEffect } from "react";
import { Modal, Form, Select, Switch, message } from "antd";
import { IRankOverridePayload } from "../types";
import { customersService } from "../api";

interface OverrideRankModalProps {
  userId: string;
  userName: string;
  currentRank: string;
  currentLock: boolean;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const { Option } = Select;

const OverrideRankModal: React.FC<OverrideRankModalProps> = ({
  userId,
  userName,
  currentRank,
  currentLock,
  open,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        rank: currentRank,
        rank_lock: currentLock,
      });
    }
  }, [open, currentRank, currentLock, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await customersService.overrideRank(userId, values as IRankOverridePayload);
      message.success(`Đã cập nhật hạng cho ${userName}`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to override rank:", error);
      message.error("Cập nhật hạng thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Điều chỉnh hạng: ${userName}`}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="rank"
          label="Hạng khách hàng"
          rules={[{ required: true, message: "Vui lòng chọn hạng" }]}
        >
          <Select placeholder="Chọn hạng">
            <Option value="BRONZE">BRONZE (Đồng)</Option>
            <Option value="SILVER">SILVER (Bạc)</Option>
            <Option value="GOLD">GOLD (Vàng)</Option>
            <Option value="PLATINUM">PLATINUM (Bạch kim)</Option>
            <Option value="DIAMOND">DIAMOND (Kim cương)</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="rank_lock"
          label="Khóa hạng"
          valuePropName="checked"
          tooltip="Nếu khóa, hạng sẽ không tự động thay đổi dựa trên chi tiêu"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default OverrideRankModal;
