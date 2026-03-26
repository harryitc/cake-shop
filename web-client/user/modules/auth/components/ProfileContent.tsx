"use client";

import { Form, Input, Button, Card, Divider, App, Spin, Modal } from "antd";
import { LockOutlined, MailOutlined, UserOutlined, PhoneOutlined, HomeOutlined } from "@ant-design/icons";
import { useMeQuery, useUpdateProfileMutation, useChangePasswordMutation } from "../hooks";
import { AvatarUpload } from "./AvatarUpload";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const ProfileContent = () => {
  const { message } = App.useApp();
  const router = useRouter();
  const { data: user, isLoading } = useMeQuery();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfileMutation();
  const { mutate: changePassword, isPending: isChangingPass } = useChangePasswordMutation();
  
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [passForm] = Form.useForm();

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        full_name: user.full_name,
        phone: user.phone,
        address: user.address,
        avatar_url: user.avatar_url,
      });
    }
  }, [user, form]);

  const onUpdateProfile = (values: any) => {
    // Loại bỏ email vì backend không cho phép update email qua api này
    const { email, ...updateData } = values;
    
    updateProfile(updateData, {
      onSuccess: () => message.success("Cập nhật thông tin thành công"),
      onError: (err) => message.error(err.message || "Lỗi cập nhật"),
    });
  };

  const onChangePassword = (values: any) => {
    changePassword(values, {
      onSuccess: () => {
        message.success("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.");
        setIsPassModalOpen(false);
        passForm.resetFields();
        // Logout
        localStorage.removeItem("access_token");
        router.push("/login");
      },
      onError: (err) => message.error(err.message || "Lỗi đổi mật khẩu"),
    });
  };

  if (isLoading) return <div className="flex justify-center p-20"><Spin size="large" /></div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-black text-gray-900 mb-8">Hồ Sơ Cá Nhân</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cột trái: Avatar */}
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

        {/* Cột phải: Form thông tin */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <Card className="rounded-2xl shadow-sm border-gray-100" title={<span className="font-bold">Thông tin cơ bản</span>}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onUpdateProfile}
            >
              <Form.Item label="Email (Không thể thay đổi)" name="email" initialValue={user?.email}>
                <Input prefix={<MailOutlined className="text-gray-400" />} disabled className="rounded-lg bg-gray-50" />
              </Form.Item>

              <Form.Item label="Họ và Tên" name="full_name">
                <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="Nhập họ tên của bạn" className="rounded-lg" />
              </Form.Item>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Form.Item label="Số điện thoại" name="phone">
                  <Input prefix={<PhoneOutlined className="text-gray-400" />} placeholder="Nhập số điện thoại" className="rounded-lg" />
                </Form.Item>
                <Form.Item label="Địa chỉ" name="address">
                  <Input prefix={<HomeOutlined className="text-gray-400" />} placeholder="Nhập địa chỉ mặc định" className="rounded-lg" />
                </Form.Item>
              </div>

              <Button type="primary" htmlType="submit" loading={isUpdating} className="bg-indigo-600 font-bold h-10 rounded-lg px-8">
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

      {/* Modal Đổi mật khẩu */}
      <Modal
        title={<span className="font-black text-xl">Thiết lập Mật khẩu mới</span>}
        open={isPassModalOpen}
        onCancel={() => setIsPassModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={passForm}
          layout="vertical"
          onFinish={onChangePassword}
          className="mt-6"
        >
          <Form.Item 
            label="Mật khẩu hiện tại" 
            name="oldPassword" 
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ" }]}
          >
            <Input.Password prefix={<LockOutlined className="text-gray-400" />} className="rounded-lg" />
          </Form.Item>

          <Form.Item 
            label="Mật khẩu mới" 
            name="newPassword" 
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới" },
              { min: 6, message: "Mật khẩu phải từ 6 ký tự" }
            ]}
          >
            <Input.Password prefix={<LockOutlined className="text-gray-400" />} className="rounded-lg" />
          </Form.Item>

          <Form.Item 
            label="Xác nhận mật khẩu mới" 
            name="confirmPassword" 
            dependencies={['newPassword']}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined className="text-gray-400" />} className="rounded-lg" />
          </Form.Item>

          <div className="flex gap-3 justify-end mt-8">
            <Button onClick={() => setIsPassModalOpen(false)} className="rounded-lg h-10 px-6 font-semibold">Hủy Bỏ</Button>
            <Button type="primary" htmlType="submit" loading={isChangingPass} className="bg-indigo-600 rounded-lg h-10 px-6 font-bold">
              Cập nhật mật khẩu
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
