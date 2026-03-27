"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, Input, Button, message } from "antd";
import { useLoginMutation, useMeQuery } from "../hooks";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

const loginSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email").email("Email không đúng định dạng"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const router = useRouter();
  const { mutate: login, isPending } = useLoginMutation();
  const { data: user } = useMeQuery({
    enabled: !!(typeof window !== "undefined" && localStorage.getItem("access_token")),
  });

  useEffect(() => {
    if (user && user.role === "admin") {
      router.replace("/admin/cakes");
    }
  }, [user, router]);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: LoginFormValues) => {
    login(values, {
      onSuccess: (res) => {
        if (res.user.role !== "admin") {
          message.error("Tài khoản không có quyền Admin!");
          return;
        }
        localStorage.setItem("access_token", res.token);
        message.success("Đăng nhập Admin thành công");
        router.push("/admin/cakes");
      },
      onError: (err) => {
        message.error(err.message || "Đăng nhập thất bại");
      },
    });
  };

  return (
    <div className="w-full bg-white/90 backdrop-blur-md rounded-[24px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 p-10 md:p-12">
      <div className="flex flex-col items-center mb-10">
        <div className="w-20 h-20 bg-gradient-to-tr from-[#533afd] to-purple-500 rounded-[20px] shadow-lg flex items-center justify-center text-4xl mb-6">👑</div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Admin Login</h2>
        <p className="text-gray-500 font-medium mt-2">Truy cập Cake Shop Dashboard</p>
      </div>
      
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Form.Item
          label={<span className="font-bold text-gray-700">Email Quản Trị</span>}
          validateStatus={errors.email ? "error" : ""}
          help={errors.email?.message}
        >
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="admin@cakeshop.com" size="large" className="rounded-xl h-14" />
            )}
          />
        </Form.Item>

        <Form.Item
          label={<span className="font-bold text-gray-700">Mật Khẩu</span>}
          validateStatus={errors.password ? "error" : ""}
          help={errors.password?.message}
        >
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Input.Password {...field} placeholder="••••••••" size="large" className="rounded-xl h-14" />
            )}
          />
          <div className="flex justify-end mt-1">
            <Link href="/forgot-password" className="text-xs text-[#533afd] hover:text-[#3f2bcf]">
              Quên mật khẩu?
            </Link>
          </div>
        </Form.Item>

        <Form.Item className="mt-10 mb-2">
          <Button
            type="primary"
            htmlType="submit"
            className="w-full h-[56px] text-[17px] rounded-xl shadow-[0_8px_20px_-6px_rgba(83,58,253,0.3)] font-extrabold transition-all hover:scale-[1.02] bg-[#533afd] hover:bg-[#3f2bcf]"
            loading={isPending}
          >
            Vào Hệ Thống
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
