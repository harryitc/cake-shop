"use client";

import { Card, Form, Input, Button, Progress, Avatar } from "antd";
import { MailOutlined, UserOutlined, PhoneOutlined, HomeOutlined, TrophyOutlined, StarOutlined } from "@ant-design/icons";
import { Controller } from "react-hook-form";
import { AvatarUpload } from "../AvatarUpload";
import { useLoyaltyQuery } from "@/modules/loyalty/hooks";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";

interface OverviewSectionProps {
  user: any;
  profileControl: any;
  handleProfileSubmit: any;
  onUpdateProfile: any;
  isUpdating: boolean;
  isProfileDirty: boolean;
  isProfileValid: boolean;
  updateProfileAvatar: (path: string) => void;
}

const RANK_COLORS = {
  BRONZE: { from: "#cd7f32", to: "#a05a2c" },
  SILVER: { from: "#c0c0c0", to: "#8e8e8e" },
  GOLD: { from: "#D4AF37", to: "#F1B24A" },
  DIAMOND: { from: "#b9f2ff", to: "#73d1e6" },
};

const NEXT_TIER_THRESHOLDS = {
  BRONZE: { next: "SILVER", min: 2000000 },
  SILVER: { next: "GOLD", min: 5000000 },
  GOLD: { next: "DIAMOND", min: 10000000 },
  DIAMOND: { next: null, min: 0 },
};

export const OverviewSection = ({ 
  user, 
  profileControl, 
  handleProfileSubmit, 
  onUpdateProfile, 
  isUpdating, 
  isProfileDirty, 
  isProfileValid,
  updateProfileAvatar
}: OverviewSectionProps) => {
  const { data: loyaltyData } = useLoyaltyQuery();
  const rank = loyaltyData?.rank || "BRONZE";
  const points = loyaltyData?.loyalty_points || 0;
  const spent = loyaltyData?.total_spent || 0;
  
  const nextTier = NEXT_TIER_THRESHOLDS[rank as keyof typeof NEXT_TIER_THRESHOLDS];
  const percent = nextTier.next ? Math.min((spent / nextTier.min) * 100, 100) : 100;
  const colors = RANK_COLORS[rank as keyof typeof RANK_COLORS];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
      {/* Premium Loyalty Card */}
      <div 
        className="rounded-2xl p-6 text-white shadow-xl overflow-hidden relative group"
        style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to}, #2d3436)` }}
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-24 translate-x-24 blur-3xl group-hover:bg-white/20 transition-all duration-700" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shadow-inner">
                <TrophyOutlined className="text-2xl text-white drop-shadow-md" />
              </div>
              <div>
                <span className="text-white/70 uppercase text-[10px] font-black tracking-widest block mb-0.5">Hạng thành viên</span>
                <h2 className="text-xl font-black m-0 tracking-tight italic">{rank}</h2>
              </div>
            </div>
            <div className="text-right">
               <span className="text-white/70 uppercase text-[10px] font-black tracking-widest block mb-0.5">Điểm hiện có</span>
               <div className="flex items-center gap-1.5 justify-end">
                 <StarOutlined className="text-base text-white animate-pulse" />
                 <h2 className="text-xl font-black m-0">{points.toLocaleString()} <span className="text-[10px] font-medium opacity-70">pts</span></h2>
               </div>
            </div>
          </div>
          
          <div className="mt-8">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-2 items-end">
              <div className="flex flex-col gap-0.5">
                <span className="text-white/60">Tới {nextTier.next || "MAX"}</span>
                <span className="text-base font-black">{spent.toLocaleString()} đ</span>
              </div>
              <div className="text-right">
                <span className="text-white/60">Mục tiêu</span>
                <span className="text-base font-black block">{nextTier.min.toLocaleString()} đ</span>
              </div>
            </div>
            <div className="h-2.5 bg-black/20 rounded-full overflow-hidden border border-white/10 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-white/90 to-white shadow-[0_0_10px_rgba(255,255,255,0.4)] transition-all duration-1000 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Stats/Avatar Card */}
        <Card className="rounded-2xl shadow-lg shadow-gray-200/50 border-white/50 bg-white/90 backdrop-blur-sm overflow-hidden p-0 border-none">
          <div className="bg-gradient-to-r from-gray-50 to-white p-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative group cursor-pointer scale-90">
                <AvatarUpload 
                  value={user?.avatar_url} 
                  onChange={updateProfileAvatar} 
                />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-black text-gray-800 m-0">{user?.full_name}</h3>
                <span className="text-gray-400 text-xs font-bold block mt-0.5">{user?.email}</span>
                <div className="mt-3 flex gap-1.5 justify-center">
                   <div className="px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full text-[9px] font-black uppercase tracking-wider border border-[#D4AF37]/20">
                     {rank}
                   </div>
                   <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-wider border border-indigo-100">
                     {user?.role}
                   </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Basic Info Summary */}
        <div className="flex flex-col gap-4">
          <Card className="rounded-2xl shadow-lg shadow-gray-200/50 border-none bg-white/90 backdrop-blur-sm" title={<span className="font-black text-base text-gray-800">Thông tin tài khoản</span>}>
            <Form layout="vertical" onFinish={handleProfileSubmit(onUpdateProfile)} className="flex flex-col gap-1.5">
              <Form.Item label={<span className="font-bold text-gray-400 uppercase text-[9px] tracking-widest">Họ và Tên</span>} className="mb-2">
                <Controller
                  name="full_name"
                  control={profileControl}
                  render={({ field }) => <Input {...field} size="middle" prefix={<UserOutlined className="text-gray-300" />} placeholder="Họ tên" className="h-10 rounded-xl bg-gray-50 border-none focus:bg-white transition-all shadow-sm font-bold text-sm" />}
                />
              </Form.Item>
              <div className="grid grid-cols-2 gap-3">
                  <Form.Item label={<span className="font-bold text-gray-400 uppercase text-[9px] tracking-widest">Số điện thoại</span>} className="mb-2">
                    <Controller
                      name="phone"
                      control={profileControl}
                      render={({ field }) => <Input {...field} size="middle" prefix={<PhoneOutlined className="text-gray-300" />} className="h-10 rounded-xl bg-gray-50 border-none focus:bg-white transition-all shadow-sm font-bold text-sm" />}
                    />
                  </Form.Item>
                  <Form.Item label={<span className="font-bold text-gray-400 uppercase text-[9px] tracking-widest">Địa chỉ</span>} className="mb-2">
                    <Controller
                      name="address"
                      control={profileControl}
                      render={({ field }) => <Input {...field} size="middle" prefix={<HomeOutlined className="text-gray-300" />} className="h-10 rounded-xl bg-gray-50 border-none focus:bg-white transition-all shadow-sm font-bold text-sm" />}
                    />
                  </Form.Item>
              </div>

              <Button 
                type="primary" 
                htmlType="submit" 
                loading={isUpdating} 
                disabled={!isProfileDirty || !isProfileValid}
                className="bg-gray-800 hover:bg-black border-none font-black h-10 rounded-xl mt-2 text-xs"
              >
                Lưu cập nhật
              </Button>
            </Form>
          </Card>

          <Card className="rounded-2xl shadow-lg shadow-gray-200/50 border-none bg-white/90 backdrop-blur-sm" title={<span className="font-black text-base text-gray-800 flex items-center gap-2 font-bold"><StarOutlined className="text-amber-500" /> Điểm thưởng mới nhất</span>}>
             <div className="flex flex-col gap-2">
                {loyaltyData?.history?.slice(0, 2).map((item: any, idx: number) => (
                   <div key={idx} className="flex justify-between items-center bg-gray-50/50 p-3 rounded-xl border border-gray-50 transition-all hover:bg-white">
                      <div className="flex flex-col">
                         <span className="font-bold text-gray-800 text-xs truncate max-w-[120px]">{item.reason}</span>
                         <span className="text-[9px] text-gray-400 font-bold uppercase">{dayjs(item.createdAt).format("DD/MM/YYYY")}</span>
                      </div>
                      <div className={cn(
                        "px-2 py-0.5 rounded-full font-black text-xs",
                        item.type === "PLUS" ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
                      )}>
                        {item.type === "PLUS" ? "+" : ""}{item.points_change}
                      </div>
                   </div>
                ))}
                <Button type="link" onClick={() => (window as any).location.search = '?tab=rewards'} className="text-[#D4AF37] font-black uppercase text-[10px] tracking-widest mt-1 p-0 h-auto self-end">Xem tất cả</Button>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
