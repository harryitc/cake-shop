"use client";

import React, { useEffect, useState } from "react";
import { 
  Form, 
  InputNumber, 
  Button, 
  Card, 
  Divider, 
  Typography, 
  message, 
  Spin,
  Row,
  Col
} from "antd";
import { SaveOutlined, ReloadOutlined } from "@ant-design/icons";
import { ILoyaltyConfig } from "../types";
import { customersService } from "../api";

const { Title, Text } = Typography;

const LoyaltyConfigForm: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const config = await customersService.getLoyaltyConfig();
      form.setFieldsValue({
        silver_threshold: config.tier_thresholds.SILVER,
        gold_threshold: config.tier_thresholds.GOLD,
        diamond_threshold: config.tier_thresholds.DIAMOND,
        bronze_ratio: config.point_ratios.BRONZE,
        silver_ratio: config.point_ratios.SILVER,
        gold_ratio: config.point_ratios.GOLD,
        diamond_ratio: config.point_ratios.DIAMOND,
        max_discount: config.max_point_discount_percentage,
        point_vnd_ratio: config.point_to_vnd_ratio,
      });
    } catch (error) {
      console.error("Failed to fetch loyalty config:", error);
      message.error("Không thể tải cấu hình Loyalty");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const onFinish = async (values: any) => {
    setSaving(true);
    try {
      const payload: Partial<ILoyaltyConfig> = {
        tier_thresholds: {
          SILVER: values.silver_threshold,
          GOLD: values.gold_threshold,
          DIAMOND: values.diamond_threshold,
        },
        point_ratios: {
          BRONZE: values.bronze_ratio,
          SILVER: values.silver_ratio,
          GOLD: values.gold_ratio,
          DIAMOND: values.diamond_ratio,
        },
        max_point_discount_percentage: values.max_discount,
        point_to_vnd_ratio: values.point_vnd_ratio,
      };
      await customersService.updateLoyaltyConfig(payload);
      message.success("Cập nhật cấu hình thành công");
    } catch (error) {
      console.error("Failed to update loyalty config:", error);
      message.error("Cập nhật cấu hình thất bại");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" tip="Đang tải cấu hình..." />
      </Card>
    );
  }

  return (
    <Card 
      title={<Title level={4}>Cấu hình chương trình Loyalty</Title>}
      extra={
        <Button icon={<ReloadOutlined />} onClick={fetchConfig} disabled={saving}>
          Làm mới
        </Button>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          max_discount: 20,
          point_vnd_ratio: 1,
        }}
      >
        <Title level={5}>1. Ngưỡng thăng hạng (Tổng chi tiêu)</Title>
        <Text type="secondary" style={{ marginBottom: 16, display: "block" }}>
          Khách hàng sẽ tự động thăng hạng khi đạt tổng chi tiêu tương ứng.
        </Text>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Bạc (SILVER)" name="silver_threshold" rules={[{ required: true }]}>
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                suffix="VNĐ"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Vàng (GOLD)" name="gold_threshold" rules={[{ required: true }]}>
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                suffix="VNĐ"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Kim cương (DIAMOND)" name="diamond_threshold" rules={[{ required: true }]}>
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                suffix="VNĐ"
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        <Title level={5}>2. Tỷ lệ tích điểm</Title>
        <Text type="secondary" style={{ marginBottom: 16, display: "block" }}>
          Tỷ lệ tích điểm trên mỗi đơn hàng thành công (ví dụ: 0.01 = 1%).
        </Text>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="Đồng (BRONZE)" name="bronze_ratio" rules={[{ required: true }]}>
              <InputNumber style={{ width: "100%" }} step={0.01} min={0} max={1} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Bạc (SILVER)" name="silver_ratio" rules={[{ required: true }]}>
              <InputNumber style={{ width: "100%" }} step={0.01} min={0} max={1} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Vàng (GOLD)" name="gold_ratio" rules={[{ required: true }]}>
              <InputNumber style={{ width: "100%" }} step={0.01} min={0} max={1} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Kim cương (DIAMOND)" name="diamond_ratio" rules={[{ required: true }]}>
              <InputNumber style={{ width: "100%" }} step={0.01} min={0} max={1} />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        <Title level={5}>3. Cấu hình đổi điểm & Giới hạn</Title>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item 
              label="Giá trị 1 điểm quy đổi" 
              name="point_vnd_ratio" 
              tooltip="1 điểm = bao nhiêu VNĐ khi thanh toán"
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: "100%" }} min={1} suffix="VNĐ" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              label="Giảm tối đa theo đơn (%)" 
              name="max_discount" 
              tooltip="Tỷ lệ tối đa giá trị đơn hàng có thể thanh toán bằng điểm"
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: "100%" }} min={0} max={100} suffix="%" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginTop: 24 }}>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving} size="large">
            Lưu cấu hình
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default LoyaltyConfigForm;
