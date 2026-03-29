"use client";

import { Modal, Form, Input, Rate, App } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/lib/http";

interface ReviewModalProps {
  open: boolean;
  onCancel: () => void;
  cakeId: string;
  orderId: string;
  cakeName: string;
}

export const ReviewModal = ({ open, onCancel, cakeId, orderId, cakeName }: ReviewModalProps) => {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const { mutate: submitReview, isPending } = useMutation({
    mutationFn: (values: { rating: number; comment: string }) =>
      httpClient.post("/reviews", {
        cake_id: cakeId,
        order_id: orderId,
        rating: values.rating,
        comment: values.comment,
      }),
    onSuccess: () => {
      message.success("Cảm ơn bạn đã đánh giá sản phẩm!");
      queryClient.invalidateQueries({ queryKey: ["cake-reviews", cakeId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      onCancel();
      form.resetFields();
    },
    onError: (err: any) => {
      message.error(err.message || "Không thể gửi đánh giá. Vui lòng thử lại sau.");
    },
  });

  const handleOk = () => {
    form.validateFields().then((values) => {
      submitReview(values);
    });
  };

  return (
    <Modal
      title={<span className="text-xl font-bold">Đánh giá sản phẩm</span>}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={isPending}
      okText="Gửi đánh giá"
      cancelText="Hủy"
      destroyOnClose
    >
      <div className="mb-4">
        Bạn đang đánh giá cho: <span className="font-bold text-indigo-600">{cakeName}</span>
      </div>
      <Form form={form} layout="vertical" initialValues={{ rating: 5 }}>
        <Form.Item
          name="rating"
          label="Mức độ hài lòng"
          rules={[{ required: true, message: "Vui lòng chọn số sao" }]}
        >
          <Rate allowHalf className="text-2xl" />
        </Form.Item>
        <Form.Item
          name="comment"
          label="Cảm nhận của bạn"
          rules={[{ max: 500, message: "Bình luận không quá 500 ký tự" }]}
        >
          <Input.TextArea rows={4} placeholder="Hãy chia sẻ trải nghiệm của bạn về món bánh này nhé..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
