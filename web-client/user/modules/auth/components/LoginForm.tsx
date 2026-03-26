"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, Input, Button, message } from "antd";
import { useLoginMutation } from "../hooks";
import { useRouter } from "next/navigation";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email").email("Email không đúng định dạng"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginForm = ({ mode = "user" }: { mode?: "user" | "admin" }) => {
  const router = useRouter();
  const { mutate: login, isPending } = useLoginMutation();

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: LoginFormValues) => {
    login(values, {
      onSuccess: (res) => {
        localStorage.setItem("access_token", res.token);
        message.success("Đăng nhập thành công");
        // Kiểm tra quyền đối với trang admin
        if (mode === "admin" && res.user.role === "admin") {
          router.push("/admin/cakes");
        } else if (mode === "admin" && res.user.role !== "admin") {
          message.error("Tài khoản của bạn không có quyền Admin!");
          localStorage.removeItem("access_token");
        } else {
          // Trang user
          router.push("/cakes");
        }
      },
      onError: (err) => {
        message.error(err.message || "Đăng nhập thất bại");
      },
    });
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100">
      <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-800">
        {mode === "admin" ? "Admin Login" : "Đăng Nhập"}
      </h2>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Form.Item
          label={<span className="font-medium text-gray-700">Email</span>}
          validateStatus={errors.email ? "error" : ""}
          help={errors.email?.message}
        >
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="user@example.com" size="large" className="rounded-lg" />
            )}
          />
        </Form.Item>

        <Form.Item
          label={<span className="font-medium text-gray-700">Mật khẩu</span>}
          validateStatus={errors.password ? "error" : ""}
          help={errors.password?.message}
        >
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Input.Password {...field} placeholder="••••••••" size="large" className="rounded-lg" />
            )}
          />
          <div className="flex justify-end mt-1">
            <Link href="/forgot-password" size="small" className="text-xs text-indigo-600 hover:text-indigo-800">
              Quên mật khẩu?
            </Link>
          </div>
        </Form.Item>

        <Form.Item className="mt-8 mb-4">
          <Button
            type="primary"
            htmlType="submit"
            className="w-full h-12 text-lg rounded-xl shadow-md font-semibold transition-all hover:scale-[1.02]"
            loading={isPending}
          >
            Đăng Nhập
          </Button>
        </Form.Item>

        {mode === "user" && (
          <div className="text-center mt-6">
            <span className="text-gray-500">Chưa có tài khoản? </span>
            <Link href="/register" className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline transition-colors">
              Đăng ký ngay
            </Link>
          </div>
        )}
      </Form>
    </div>
  );
};
