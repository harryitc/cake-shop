"use client";

import React, { useEffect } from "react";
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
  Col,
  App
} from "antd";
import { SaveOutlined, ReloadOutlined } from "@ant-design/icons";
import { useLoyaltyConfigQuery, useUpdateLoyaltyConfigMutation } from "../hooks";

const { Title, Text } = Typography;

const LoyaltyConfigForm: React.FC = () => {
  const { message: msg } = App.useApp();
  const [form] = Form.useForm();
  
  const { data: config, isLoading, refetch } = useLoyaltyConfigQuery();
  const updateMutation = useUpdateLoyaltyConfigMutation();

  useEffect(() => {
    if (config) {
      form.setFieldsValue({
        silver_threshold: config.tier_thresholds?.SILVER,
        gold_threshold: config.tier_thresholds?.GOLD,
        diamond_threshold: config.tier_thresholds?.DIAMOND,
        bronze_ratio: config.point_ratios?.BRONZE,
        silver_ratio: config.point_ratios?.SILVER,
        gold_ratio: config.point_ratios?.GOLD,
        diamond_ratio: config.point_ratios?.DIAMOND,
        max_discount: config.max_point_discount_percentage,
        point_vnd_ratio: config.point_to_vnd_ratio,
      });
    }
  }, [config, form]);

  const onFinish = async (values: any) => {
    try {
      const payload = {
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
      await updateMutation.mutateAsync(payload);
      msg.success("Cập nhật cấu hình thành công");
    } catch (error: any) {
      msg.error(error.message || "Cập nhật cấu hình thất bại");
    }
  };

  if (isLoading) {
    return (
      <Card style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" tip="Đang tải cấu hình..." />
      </Card>
    );
  }

  return (
    <Card 
      bordered={false}
      className="shadow-sm border border-gray-100"
      title={<span className="font-black text-lg text-gray-800 tracking-tight">Cấu hình chương trình Loyalty</span>}
      extra={
        <Button 
          icon={<ReloadOutlined />} 
          onClick={() => refetch()} 
          disabled={updateMutation.isPending}
          className="rounded-lg font-bold"
        >
          Làm mới
        </Button>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="mt-2"
      >
        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 mb-8">
          <Title level={5} className="font-black !mb-1">1. Ngưỡng thăng hạng (Tổng chi tiêu)</Title>
          <Text type="secondary" style={{ marginBottom: 20, display: "block" }} className="text-xs font-medium italic">
            Khách hàng sẽ tự động thăng hạng khi đạt tổng chi tiêu tương ứng.
          </Text>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item label={<span className="font-bold text-gray-500 text-[11px] uppercase tracking-wider">Bạc (SILVER)</span>} name="silver_threshold" rules={[{ required: true }]}>
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                  suffix="đ"
                  className="rounded-xl h-10 flex items-center"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={<span className="font-bold text-gray-500 text-[11px] uppercase tracking-wider">Vàng (GOLD)</span>} name="gold_threshold" rules={[{ required: true }]}>
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                  suffix="đ"
                  className="rounded-xl h-10 flex items-center"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={<span className="font-bold text-gray-500 text-[11px] uppercase tracking-wider">Kim cương (DIAMOND)</span>} name="diamond_threshold" rules={[{ required: true }]}>
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                  suffix="đ"
                  className="rounded-xl h-10 flex items-center"
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div className="bg-indigo-50/30 p-6 rounded-2xl border border-indigo-100/50 mb-8">
          <Title level={5} className="font-black !mb-1 text-indigo-900">2. Tỷ lệ tích điểm</Title>
          <Text type="secondary" style={{ marginBottom: 20, display: "block" }} className="text-xs font-medium italic text-indigo-400">
            Tỷ lệ tích điểm trên mỗi đơn hàng thành công (ví dụ: 0.01 = 1%).
          </Text>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label={<span className="font-bold text-gray-500 text-[11px] uppercase tracking-wider">Đồng (BRONZE)</span>} name="bronze_ratio" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} step={0.01} min={0} max={1} className="rounded-xl h-10 flex items-center" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label={<span className="font-bold text-gray-500 text-[11px] uppercase tracking-wider">Bạc (SILVER)</span>} name="silver_ratio" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} step={0.01} min={0} max={1} className="rounded-xl h-10 flex items-center" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label={<span className="font-bold text-gray-500 text-[11px] uppercase tracking-wider">Vàng (GOLD)</span>} name="gold_ratio" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} step={0.01} min={0} max={1} className="rounded-xl h-10 flex items-center" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label={<span className="font-bold text-gray-500 text-[11px] uppercase tracking-wider">Kim cương (DIAMOND)</span>} name="diamond_ratio" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} step={0.01} min={0} max={1} className="rounded-xl h-10 flex items-center" />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div className="bg-amber-50/30 p-6 rounded-2xl border border-amber-100/50 mb-8">
          <Title level={5} className="font-black !mb-1 text-amber-900">3. Cấu hình đổi điểm & Giới hạn</Title>
          <Row gutter={24} className="mt-4">
            <Col span={12}>
              <Form.Item 
                label={<span className="font-bold text-gray-500 text-[11px] uppercase tracking-wider">Giá trị 1 điểm quy đổi</span>} 
                name="point_vnd_ratio" 
                tooltip="1 điểm = bao nhiêu VNĐ khi thanh toán"
                rules={[{ required: true }]}
              >
                <InputNumber style={{ width: "100%" }} min={1} suffix="đ" className="rounded-xl h-10 flex items-center" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label={<span className="font-bold text-gray-500 text-[11px] uppercase tracking-wider">Giảm tối đa theo đơn (%)</span>} 
                name="max_discount" 
                tooltip="Tỷ lệ tối đa giá trị đơn hàng có thể thanh toán bằng điểm"
                rules={[{ required: true }]}
              >
                <InputNumber style={{ width: "100%" }} min={0} max={100} suffix="%" className="rounded-xl h-10 flex items-center" />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            type="primary" 
            htmlType="submit" 
            icon={<SaveOutlined />} 
            loading={updateMutation.isPending} 
            size="large"
            className="rounded-xl h-12 px-10 bg-indigo-600 hover:bg-indigo-700 border-none shadow-lg shadow-indigo-200 font-black uppercase text-xs tracking-widest"
          >
            Lưu tất cả cấu hình
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default LoyaltyConfigForm;
