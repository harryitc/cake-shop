"use client";

import { Form, Input, Button, Card, App } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useResetPasswordMutation } from "../hooks";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const ResetPasswordFormContent = () => {
  const { message } = App.useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const { mutate: resetPassword, isPending } = useResetPasswordMutation();

  const onFinish = (values: any) => {
    if (!token) {
      message.error("Thiếu mã xác thực (Token). Vui lòng kiểm tra lại liên kết trong email.");
      return;
    }

    resetPassword({ token, password: values.password }, {
      onSuccess: () => {
        message.success("Đặt lại mật khẩu thành công. Hãy đăng nhập với mật khẩu mới.");
        router.push("/login");
      },
      onError: (err) => message.error(err.message || "Lỗi đặt lại mật khẩu"),
    });
  };

  return (
    <Card className="max-w-md mx-auto mt-20 rounded-2xl shadow-xl border-none p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mật Khẩu Mới</h1>
        <p className="text-gray-500 mt-2">Thiết lập mật khẩu truy cập mới cho tài khoản của bạn.</p>
      </div>

      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Mật khẩu mới"
          name="password"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới" },
            { min: 6, message: "Mật khẩu phải từ 6 ký tự" }
          ]}
        >
          <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="••••••" size="large" className="rounded-lg h-12" />
        </Form.Item>

        <Form.Item
          label="Xác nhận mật khẩu"
          name="confirm"
          dependencies={['password']}
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="••••••" size="large" className="rounded-lg h-12" />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          block
          size="large"
          loading={isPending}
          className="bg-indigo-600 hover:bg-indigo-700 h-12 rounded-lg font-bold text-lg mt-4 shadow-lg"
        >
          Đặt lại mật khẩu
        </Button>
      </Form>
    </Card>
  );
};

export const ResetPasswordForm = () => (
  <Suspense fallback={<div className="text-center p-20 text-gray-500">Đang tải...</div>}>
    <ResetPasswordFormContent />
  </Suspense>
);
