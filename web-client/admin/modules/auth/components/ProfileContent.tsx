"use client";

import { Form, Input, Button, Card, App, Spin, Modal } from "antd";
import { LockOutlined, MailOutlined, UserOutlined, PhoneOutlined, HomeOutlined } from "@ant-design/icons";
import { useMeQuery, useUpdateProfileMutation, useChangePasswordMutation } from "../hooks";
import { AvatarUpload } from "./AvatarUpload";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const profileSchema = z.object({
  full_name: z.string().min(1, "Vui lòng nhập họ tên"),
  phone: z.string().optional(),
  address: z.string().optional(),
  avatar_url: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  oldPassword: z.string().min(1, "Vui lòng nhập mật khẩu cũ"),
  newPassword: z.string().min(6, "Mật khẩu phải từ 6 ký tự"),
  confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp!",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export const ProfileContent = () => {
  const { message } = App.useApp();
  const { data: user, isLoading } = useMeQuery();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfileMutation();
  const { mutate: changePassword, isPending: isChangingPass } = useChangePasswordMutation();
  
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  const { control: profileControl, handleSubmit: handleProfileSubmit, reset: resetProfile, formState: { isDirty: isProfileDirty, isValid: isProfileValid } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    defaultValues: { full_name: "", phone: "", address: "", avatar_url: "" }
  });

  const { control: passControl, handleSubmit: handlePassSubmit, reset: resetPass, formState: { errors: passErrors, isDirty: isPassDirty, isValid: isPassValid } } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    mode: "onChange",
    defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" }
  });

  useEffect(() => {
    if (user) {
      resetProfile({
        full_name: user.full_name || "",
        phone: user.phone || "",
        address: user.address || "",
        avatar_url: user.avatar_url || "",
      });
    }
  }, [user, resetProfile]);

  const onUpdateProfile = (values: ProfileFormValues) => {
    updateProfile(values, {
      onSuccess: () => {
        message.success("Cập nhật thông tin thành công");
        resetProfile(values);
      },
      onError: (err) => message.error(err.message || "Lỗi cập nhật"),
    });
  };

  const onChangePassword = (values: PasswordFormValues) => {
    changePassword(values, {
      onSuccess: () => {
        message.success("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.");
        setIsPassModalOpen(false);
        resetPass();
        localStorage.removeItem("access_token");
        window.location.href = "/admin/login";
      },
      onError: (err) => message.error(err.message || "Lỗi đổi mật khẩu"),
    });
  };

  if (isLoading) return <div className="flex justify-center p-20"><Spin size="large" /></div>;

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-black text-gray-900 mb-8">Hồ Sơ Cá Nhân</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="rounded-2xl shadow-sm border-gray-100 flex flex-col items-center justify-center p-6 text-center">
          <AvatarUpload 
            value={user?.avatar_url} 
            onChange={(path) => updateProfile({ avatar_url: path })} 
          />
          <div className="mt-4">
            <div className="font-bold text-lg text-gray-800">{user?.full_name || "Chưa đặt tên"}</div>
            <div className="text-gray-500 text-sm">{user?.email}</div>
            <div className="mt-2 inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider">
              {user?.role}
            </div>
          </div>
        </Card>

        <div className="md:col-span-2 flex flex-col gap-6">
          <Card className="rounded-2xl shadow-sm border-gray-100" title={<span className="font-bold">Thông tin cơ bản</span>}>
            <Form layout="vertical" onFinish={handleProfileSubmit(onUpdateProfile)}>
              <Form.Item label="Email (Không thể thay đổi)">
                <Input prefix={<MailOutlined className="text-gray-400" />} value={user?.email} disabled className="rounded-lg bg-gray-50" />
              </Form.Item>

              <Form.Item label="Họ và Tên">
                <Controller
                  name="full_name"
                  control={profileControl}
                  render={({ field }) => <Input {...field} prefix={<UserOutlined className="text-gray-400" />} placeholder="Nhập họ tên của bạn" className="rounded-lg" />}
                />
              </Form.Item>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Form.Item label="Số điện thoại">
                  <Controller
                    name="phone"
                    control={profileControl}
                    render={({ field }) => <Input {...field} prefix={<PhoneOutlined className="text-gray-400" />} placeholder="Nhập số điện thoại" className="rounded-lg" />}
                  />
                </Form.Item>
                <Form.Item label="Địa chỉ">
                  <Controller
                    name="address"
                    control={profileControl}
                    render={({ field }) => <Input {...field} prefix={<HomeOutlined className="text-gray-400" />} placeholder="Nhập địa chỉ mặc định" className="rounded-lg" />}
                  />
                </Form.Item>
              </div>

              <Button 
                type="primary" 
                htmlType="submit" 
                loading={isUpdating} 
                disabled={!isProfileDirty || !isProfileValid}
                className="bg-indigo-600 font-bold h-10 rounded-lg px-8"
              >
                Lưu Thay Đổi
              </Button>
            </Form>
          </Card>

          <Card className="rounded-2xl shadow-sm border-gray-100 mt-6" title={<span className="font-bold text-red-600">Bảo mật</span>}>
            <p className="text-gray-500 mb-4">Bạn nên đổi mật khẩu định kỳ để bảo vệ tài khoản.</p>
            <Button danger icon={<LockOutlined />} onClick={() => setIsPassModalOpen(true)} className="font-semibold rounded-lg h-10">
              Đổi mật khẩu truy cập
            </Button>
          </Card>
        </div>
      </div>

      <Modal
        title={<span className="font-black text-xl">Thiết lập Mật khẩu mới</span>}
        open={isPassModalOpen}
        onCancel={() => setIsPassModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          layout="vertical"
          onFinish={handlePassSubmit(onChangePassword)}
          className="mt-6"
        >
          <Form.Item 
            label="Mật khẩu hiện tại" 
            validateStatus={passErrors.oldPassword ? "error" : ""} 
            help={passErrors.oldPassword?.message}
            required
          >
            <Controller
              name="oldPassword"
              control={passControl}
              render={({ field }) => <Input.Password {...field} prefix={<LockOutlined className="text-gray-400" />} className="rounded-lg" />}
            />
          </Form.Item>

          <Form.Item 
            label="Mật khẩu mới" 
            validateStatus={passErrors.newPassword ? "error" : ""} 
            help={passErrors.newPassword?.message}
            required
          >
            <Controller
              name="newPassword"
              control={passControl}
              render={({ field }) => <Input.Password {...field} prefix={<LockOutlined className="text-gray-400" />} className="rounded-lg" />}
            />
          </Form.Item>

          <Form.Item 
            label="Xác nhận mật khẩu mới" 
            validateStatus={passErrors.confirmPassword ? "error" : ""} 
            help={passErrors.confirmPassword?.message}
            required
          >
            <Controller
              name="confirmPassword"
              control={passControl}
              render={({ field }) => <Input.Password {...field} prefix={<LockOutlined className="text-gray-400" />} className="rounded-lg" />}
            />
          </Form.Item>

          <div className="flex gap-3 justify-end mt-8">
            <Button onClick={() => setIsPassModalOpen(false)} className="rounded-lg h-10 px-6 font-semibold">Hủy Bỏ</Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isChangingPass} 
              disabled={!isPassDirty || !isPassValid}
              className="bg-indigo-600 rounded-lg h-10 px-6 font-bold"
            >
              Cập nhật mật khẩu
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
