"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, Input, Button, message } from "antd";
import { useRegisterMutation } from "../hooks";
import { useRouter } from "next/navigation";
import Link from "next/link";

const registerSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email").email("Email không đúng định dạng"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const router = useRouter();
  const { mutate: register, isPending } = useRegisterMutation();

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: RegisterFormValues) => {
    register(values, {
      onSuccess: (res) => {
        localStorage.setItem("access_token", res.token);
        message.success("Đăng ký thành công!");
        router.push("/cakes");
      },
      onError: (err) => {
        message.error(err.message || "Đăng ký thất bại");
      },
    });
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100">
      <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-800">
        Tạo Tài Khoản
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
        </Form.Item>

        <Form.Item className="mt-8 mb-4">
          <Button
            type="primary"
            htmlType="submit"
            className="w-full h-12 text-lg rounded-xl shadow-md font-semibold transition-all hover:scale-[1.02]"
            loading={isPending}
          >
            Đăng Ký
          </Button>
        </Form.Item>

        <div className="text-center mt-6">
          <span className="text-gray-500">Đã có tài khoản? </span>
          <Link href="/login" className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline transition-colors">
            Đăng nhập ngay
          </Link>
        </div>
      </Form>
    </div>
  );
};
