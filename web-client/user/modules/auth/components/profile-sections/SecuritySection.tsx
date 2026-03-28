"use client";

import { Card, Form, Input, Button, Modal, App } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { Controller } from "react-hook-form";

interface SecuritySectionProps {
  passControl: any;
  handlePassSubmit: any;
  onChangePassword: any;
  isChangingPass: boolean;
  isPassDirty: boolean;
  isPassValid: boolean;
  passErrors: any;
  isPassModalOpen: boolean;
  setIsPassModalOpen: (open: boolean) => void;
}

export const SecuritySection = ({
  passControl,
  handlePassSubmit,
  onChangePassword,
  isChangingPass,
  isPassDirty,
  isPassValid,
  passErrors,
  isPassModalOpen,
  setIsPassModalOpen
}: SecuritySectionProps) => {
  return (
    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-5 duration-500">
      <Card className="rounded-3xl shadow-xl shadow-gray-200/50 border-none bg-white/80 backdrop-blur-md overflow-hidden">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100 shadow-sm">
                <LockOutlined className="text-2xl text-red-500" />
             </div>
             <div>
                <h3 className="text-xl font-black text-gray-800 m-0">Bảo mật tài khoản</h3>
                <p className="text-gray-400 font-medium m-0 mt-1">Quản lý mật khẩu và các tùy chọn bảo mật khác.</p>
             </div>
          </div>
          
          <div className="p-6 bg-red-50/50 rounded-2xl border border-red-100 flex items-center justify-between gap-6">
             <div className="flex-1">
                <h4 className="font-black text-gray-800 m-0">Mật khẩu truy cập</h4>
                <p className="text-gray-500 text-sm m-0 mt-1">Đổi mật khẩu định kỳ giúp tăng cường khả năng bảo vệ tài khoản của bạn.</p>
             </div>
             <Button 
               danger 
               icon={<LockOutlined />} 
               onClick={() => setIsPassModalOpen(true)} 
               className="font-black rounded-xl h-12 px-8 shadow-lg shadow-red-200"
             >
                Thay đổi
             </Button>
          </div>
        </div>
      </Card>

      <Modal
        title={<div className="font-black text-2xl text-gray-800 pt-4 px-2 tracking-tight">Thiết lập Mật khẩu mới</div>}
        open={isPassModalOpen}
        onCancel={() => setIsPassModalOpen(false)}
        footer={null}
        destroyOnClose
        centered
        className="rounded-3xl overflow-hidden"
        width={500}
      >
        <Form
          layout="vertical"
          onFinish={handlePassSubmit(onChangePassword)}
          className="mt-6 p-2"
        >
          <Form.Item 
            label={<span className="font-bold text-gray-500 uppercase text-xs tracking-widest">Mật khẩu hiện tại</span>} 
            validateStatus={passErrors.oldPassword ? "error" : ""} 
            help={passErrors.oldPassword?.message}
            required
          >
            <Controller
              name="oldPassword"
              control={passControl}
              render={({ field }) => <Input.Password {...field} placeholder="Nhập mật khẩu hiện tại" className="h-12 rounded-xl bg-gray-50 border-none focus:bg-white transition-all shadow-sm" />}
            />
          </Form.Item>

          <Form.Item 
            label={<span className="font-bold text-gray-500 uppercase text-xs tracking-widest">Mật khẩu mới</span>} 
            validateStatus={passErrors.newPassword ? "error" : ""} 
            help={passErrors.newPassword?.message}
            required
          >
            <Controller
              name="newPassword"
              control={passControl}
              render={({ field }) => <Input.Password {...field} placeholder="Tối thiểu 6 ký tự" className="h-12 rounded-xl bg-gray-50 border-none focus:bg-white transition-all shadow-sm" />}
            />
          </Form.Item>

          <Form.Item 
            label={<span className="font-bold text-gray-500 uppercase text-xs tracking-widest">Xác nhận mật khẩu mới</span>} 
            validateStatus={passErrors.confirmPassword ? "error" : ""} 
            help={passErrors.confirmPassword?.message}
            required
          >
            <Controller
              name="confirmPassword"
              control={passControl}
              render={({ field }) => <Input.Password {...field} placeholder="Nhập lại mật khẩu mới" className="h-12 rounded-xl bg-gray-50 border-none focus:bg-white transition-all shadow-sm" />}
            />
          </Form.Item>

          <div className="flex gap-3 justify-end mt-10">
            <Button onClick={() => setIsPassModalOpen(false)} className="rounded-xl h-12 px-8 font-black border-none bg-gray-100 hover:bg-gray-200 transition-all">Hủy bỏ</Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isChangingPass} 
              disabled={!isPassDirty || !isPassValid}
              className="bg-indigo-600 rounded-xl h-12 px-8 font-black shadow-lg shadow-indigo-200"
            >
              Cập nhật mới
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
