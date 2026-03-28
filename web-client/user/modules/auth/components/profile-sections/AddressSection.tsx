"use client";

import { Card, Form, Input, Button, Avatar } from "antd";
import { HomeOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Controller } from "react-hook-form";

interface AddressSectionProps {
  profileControl: any;
  handleProfileSubmit: any;
  onUpdateProfile: any;
  isUpdating: boolean;
  isProfileDirty: boolean;
  isProfileValid: boolean;
}

export const AddressSection = ({
  profileControl,
  handleProfileSubmit,
  onUpdateProfile,
  isUpdating,
  isProfileDirty,
  isProfileValid,
}: AddressSectionProps) => {
  return (
    <div className="max-w-xl animate-in fade-in slide-in-from-bottom-5 duration-500">
      <Card 
        className="rounded-2xl shadow-lg shadow-gray-200/50 border-none bg-white/8backdrop-blur-md overflow-hidden" 
        title={<span className="font-black text-lg text-gray-800">Sổ địa chỉ giao hàng</span>}
      >
        <div className="flex flex-col gap-4">
           <div className="p-4 bg-gradient-to-br from-indigo-50 to-white rounded-xl border border-indigo-100 flex items-start gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center border border-indigo-100 shadow-sm">
                 <HomeOutlined className="text-base text-white" />
              </div>
              <div className="flex-1">
                 <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 mb-1 inline-block">Mặc định</span>
                 </div>
                 <Form onFinish={handleProfileSubmit(onUpdateProfile)}>
                    <Form.Item label={<span className="font-bold text-gray-400 uppercase text-[9px] tracking-widest">Địa chỉ gửi bánh</span>} className="mb-2">
                       <Controller
                         name="address"
                         control={profileControl}
                         render={({ field }) => (
                           <Input.TextArea 
                             {...field} 
                             rows={2} 
                             placeholder="Địa chỉ nhận bánh..." 
                             className="rounded-xl bg-gray-50/50 border-none focus:bg-white transition-all shadow-sm p-3 font-bold text-xs text-gray-700" 
                           />
                         )}
                       />
                    </Form.Item>
                    <div className="flex justify-end">
                       <Button 
                         type="primary" 
                         htmlType="submit" 
                         loading={isUpdating} 
                         disabled={!isProfileDirty || !isProfileValid}
                         className="bg-indigo-600 rounded-lg h-9 px-6 font-black text-xs shadow-md shadow-indigo-100"
                       >
                         Lưu địa chỉ
                       </Button>
                    </div>
                 </Form>
              </div>
           </div>
           
           <Button icon={<PlusOutlined />} className="w-full h-10 rounded-xl border-dashed border-2 border-gray-200 text-gray-400 font-bold hover:border-indigo-300 hover:text-indigo-500 transition-all text-xs">
              Thêm địa chỉ mới
           </Button>
        </div>
      </Card>
    </div>
  );
};
