"use client";

import { Form, Input, Button, Card, App } from "antd";
import { MailOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useForgotPasswordMutation } from "../hooks";
import Link from "next/link";
import { useState } from "react";

export const ForgotPasswordForm = () => {
  const { message } = App.useApp();
  const [isSent, setIsSent] = useState(false);
  const { mutate: forgotPassword, isPending } = useForgotPasswordMutation();

  const onFinish = (values: { email: string }) => {
    forgotPassword(values.email, {
      onSuccess: (data) => {
        setIsSent(true);
        message.success("Yêu cầu đã được gửi. Vui lòng kiểm tra email của bạn.");
        // Lưu ý: data.token được trả về ở test mode, trong thực tế sẽ lấy từ email.
        console.log("Mô phỏng token từ email:", data.token);
      },
      onError: (err) => message.error(err.message || "Lỗi hệ thống"),
    });
  };

  if (isSent) {
    return (
      <Card className="max-w-md mx-auto mt-20 rounded-2xl shadow-xl border-none p-4">
        <div className="text-center py-8">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">Kiểm tra Email</h2>
          <p className="text-gray-500 mb-8">
            Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn. 
            (Trong bản demo này, hãy kiểm tra **Console Log** của trình duyệt để lấy Token).
          </p>
          <Link href="/admin/login">
            <Button type="primary" size="large" className="bg-indigo-600 font-bold rounded-lg px-10">
              Quay lại Đăng nhập
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto mt-20 rounded-2xl shadow-xl border-none p-4">
      <div className="mb-8">
        <Link href="/admin/login" className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2 font-medium mb-4">
          <ArrowLeftOutlined /> Quay lại
        </Link>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Quên Mật Khẩu?</h1>
        <p className="text-gray-500 mt-2">Nhập email của bạn để nhận liên kết đặt lại mật khẩu.</p>
      </div>

      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Địa chỉ Email"
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Email không hợp lệ" }
          ]}
        >
          <Input prefix={<MailOutlined className="text-gray-400" />} placeholder="your@email.com" size="large" className="rounded-lg h-12" />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          block
          size="large"
          loading={isPending}
          className="bg-indigo-600 hover:bg-indigo-700 h-12 rounded-lg font-bold text-lg mt-4 shadow-lg"
        >
          Gửi yêu cầu
        </Button>
      </Form>
    </Card>
  );
};
