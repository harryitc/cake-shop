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
import { SaveOutlined, ReloadOutlined, SyncOutlined } from "@ant-design/icons";
import { useLoyaltyConfigQuery, useUpdateLoyaltyConfigMutation, useRecalculateRanksMutation } from "../hooks";

const { Title, Text } = Typography;

const LoyaltyConfigForm: React.FC = () => {
  const { message: msg, modal } = App.useApp();
  const [form] = Form.useForm();
  
  const { data: config, isLoading, refetch } = useLoyaltyConfigQuery();
  const updateMutation = useUpdateLoyaltyConfigMutation();
  const recalculateMutation = useRecalculateRanksMutation();

  const handleRecalculate = () => {
    modal.confirm({
      title: 'Tái thẩm định hạng thành viên',
      content: 'Hệ thống sẽ quét toàn bộ khách hàng và cập nhật lại hạng dựa trên cấu hình hiện tại. Bạn có muốn tiếp tục?',
      okText: 'Bắt đầu quét',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const result = await recalculateMutation.mutateAsync({});
          msg.success(`Thành công! Đã quét ${result.total_scanned} khách hàng và cập nhật ${result.total_updated} người.`);
        } catch (error: any) {
          msg.error(error.message || "Lỗi khi tái thẩm định hạng");
        }
      }
    });
  };

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

        <Divider className="my-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Button 
            type="primary" 
            htmlType="submit" 
            icon={<SaveOutlined />} 
            loading={updateMutation.isPending} 
            size="large"
            className="w-full md:w-auto rounded-xl h-12 px-12 bg-indigo-600 hover:bg-indigo-700 border-none shadow-lg shadow-indigo-200 font-black uppercase text-xs tracking-widest"
          >
            Lưu tất cả cấu hình
          </Button>

          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 w-full md:w-auto">
            <div className="hidden sm:block text-right">
              <p className="m-0 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Thao tác nâng cao</p>
              <p className="m-0 text-[9px] text-gray-400 italic font-medium leading-none">Áp dụng luật mới cho toàn bộ khách hàng</p>
            </div>
            <Button 
              type="default" 
              size="large"
              icon={<SyncOutlined />} 
              loading={recalculateMutation.isPending}
              onClick={() => {
                modal.confirm({
                  title: <span className="font-black text-lg">Tái thẩm định hạng thành viên</span>,
                  icon: <SyncOutlined className="text-indigo-600" />,
                  content: (
                    <div className="mt-4">
                      <p className="text-gray-500 text-sm mb-4 italic">Hệ thống sẽ quét khách hàng và cập nhật lại hạng dựa trên cấu hình hiện tại. Bạn có thể chọn lọc theo hạng:</p>
                      <Form layout="vertical" id="recalc-filter-form">
                        <Form.Item name="filterRank" label={<span className="font-bold text-gray-400 text-[10px] uppercase">Lọc theo hạng hiện tại</span>}>
                          <select 
                            id="rank-select" 
                            className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm focus:border-indigo-500 focus:outline-none bg-white font-bold text-gray-700"
                          >
                            <option value="">Tất cả khách hàng</option>
                            <option value="BRONZE">Hạng Đồng</option>
                            <option value="SILVER">Hạng Bạc</option>
                            <option value="GOLD">Hạng Vàng</option>
                            <option value="DIAMOND">Hạng Kim cương</option>
                          </select>
                        </Form.Item>
                      </Form>
                    </div>
                  ),
                  okText: 'Bắt đầu quét',
                  cancelText: 'Hủy',
                  okButtonProps: { className: "rounded-lg font-bold bg-indigo-600 border-none" },
                  cancelButtonProps: { className: "rounded-lg font-bold" },
                  onOk: async () => {
                    const rankValue = (document.getElementById('rank-select') as HTMLSelectElement)?.value;
                    try {
                      const result = await recalculateMutation.mutateAsync({ rank: rankValue || undefined });
                      msg.success(`Thành công! Đã quét ${result.total_scanned} khách hàng và cập nhật ${result.total_updated} người.`);
                    } catch (error: any) {
                      msg.error(error.message || "Lỗi khi tái thẩm định hạng");
                    }
                  }
                });
              }}
              className="w-full sm:w-auto rounded-xl h-12 px-8 border-2 border-indigo-600 text-indigo-600 hover:!text-indigo-700 hover:!border-indigo-700 font-black uppercase text-xs tracking-widest"
            >
              Tái thẩm định hạng
            </Button>
          </div>
        </div>
      </Form>
    </Card>
  );
};

export default LoyaltyConfigForm;
