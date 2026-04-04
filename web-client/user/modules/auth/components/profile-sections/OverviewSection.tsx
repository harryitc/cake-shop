"use client";

import { Card, Form, Input, Button, Progress, Avatar } from "antd";
import { MailOutlined, UserOutlined, PhoneOutlined, HomeOutlined, TrophyOutlined, StarOutlined } from "@ant-design/icons";
import { Controller } from "react-hook-form";
import { AvatarUpload } from "../AvatarUpload";
import { useLoyaltyQuery, useLoyaltyConfigQuery } from "@/modules/loyalty/hooks";
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

const GET_RANK_LABEL = (rank: string) => {
  switch (rank) {
    case "BRONZE": return "Đồng";
    case "SILVER": return "Bạc";
    case "GOLD": return "Vàng";
    case "DIAMOND": return "Kim cương";
    default: return rank;
  }
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
  const { data: loyaltyConfig } = useLoyaltyConfigQuery();
  const rank = loyaltyData?.rank || user?.rank || "BRONZE";
  const points = loyaltyData?.points ?? user?.loyalty_points ?? 0;
  const spent = loyaltyData?.totalSpent ?? user?.total_spent ?? 0;
  
  const thresholds = loyaltyConfig?.tier_thresholds || {};
  
  const getNextTierInfo = (currentRank: string) => {
    switch (currentRank) {
      case "BRONZE": return { next: "SILVER", min: thresholds.SILVER || 0 };
      case "SILVER": return { next: "GOLD", min: thresholds.GOLD || 0 };
      case "GOLD": return { next: "DIAMOND", min: thresholds.DIAMOND || 0 };
      default: return { next: null, min: 0 };
    }
  };

  const nextTier = getNextTierInfo(rank);
  const percent = nextTier.next ? (nextTier.min > 0 ? Math.min((spent / nextTier.min) * 100, 100) : 0) : 100;
  const colors = RANK_COLORS[rank as keyof typeof RANK_COLORS] || RANK_COLORS.BRONZE;

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
                <h2 className="text-xl font-black m-0 tracking-tight italic">{GET_RANK_LABEL(rank)}</h2>
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
                <span className="text-white/60">Tới {nextTier.next ? GET_RANK_LABEL(nextTier.next) : "MAX"}</span>
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

      <div className="flex flex-col gap-6">
        {/* Row 1: Profile & Identity + Basic Info Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Stats/Avatar Card */}
          <Card className="lg:col-span-1 rounded-2xl shadow-lg shadow-gray-200/50 border-none bg-white/90 backdrop-blur-sm overflow-hidden p-0">
            <div className="bg-gradient-to-br from-gray-50/50 to-white p-6 h-full flex flex-col items-center justify-center">
              <div className="relative group cursor-pointer scale-90 mb-2">
                <AvatarUpload 
                  value={user?.avatar} 
                  onChange={updateProfileAvatar} 
                />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-black text-gray-800 m-0">{user?.name}</h3>
                <span className="text-gray-400 text-xs font-bold block mt-0.5">{user?.email}</span>
                <div className="mt-4 flex gap-1.5 justify-center flex-wrap">
                   <div className="px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full text-[9px] font-black uppercase tracking-wider border border-[#D4AF37]/20">
                     {GET_RANK_LABEL(rank)}
                   </div>
                   <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-wider border border-indigo-100">
                     {user?.role}
                   </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Account Info Form Section */}
          <Card className="lg:col-span-2 rounded-2xl shadow-lg shadow-gray-200/50 border-none bg-white/90 backdrop-blur-sm" title={<span className="font-black text-base text-gray-800">Thông tin tài khoản</span>}>
            <Form layout="vertical" onFinish={handleProfileSubmit(onUpdateProfile)} className="flex flex-col gap-1.5">
              <Form.Item label={<span className="font-bold text-gray-400 uppercase text-[9px] tracking-widest">Họ và Tên</span>} className="mb-2">
                <Controller
                  name="name"
                  control={profileControl}
                  render={({ field }) => <Input {...field} size="middle" prefix={<UserOutlined className="text-gray-300" />} placeholder="Họ tên" className="h-10 rounded-xl bg-gray-50 border-none focus:bg-white transition-all shadow-sm font-bold text-sm" />}
                />
              </Form.Item>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

              <div className="flex justify-end mt-2">
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={isUpdating} 
                  disabled={!isProfileDirty || !isProfileValid}
                  className="bg-gray-800 hover:bg-black border-none font-black h-10 px-8 rounded-xl text-xs"
                >
                  Lưu cập nhật
                </Button>
              </div>
            </Form>
          </Card>
        </div>

        {/* Row 2: Reward Points History - Full Width Row */}
        <Card 
          className="rounded-2xl shadow-lg shadow-gray-200/50 border-none bg-white/90 backdrop-blur-sm" 
          title={<span className="font-black text-base text-gray-800 flex items-center gap-2 font-bold"><StarOutlined className="text-amber-500" /> Điểm thưởng mới nhất</span>}
          extra={<Button type="link" onClick={() => (window as any).location.search = '?tab=rewards'} className="text-[#D4AF37] font-black uppercase text-[10px] tracking-widest p-0 h-auto">Xem tất cả</Button>}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loyaltyData?.history?.slice(0, 3).map((item: any) => (
              <div key={item.id} className="flex justify-between items-center bg-gray-50/50 p-4 rounded-xl border border-gray-50/80 transition-all hover:bg-white hover:shadow-md hover:border-[#D4AF37]/20 group">
                <div className="flex flex-col gap-1">
                    <span className="font-bold text-gray-800 text-sm group-hover:text-black transition-colors">{item.reason}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-gray-300" />
                      {dayjs(item.createdAt).format("DD/MM/YYYY")}
                    </span>
                </div>
                <div className={cn(
                  "px-3 py-1 rounded-full font-black text-sm shadow-sm",
                  item.type === "PLUS" ? "text-green-600 bg-green-50/80 border border-green-100" : "text-red-600 bg-red-50/80 border border-red-100"
                )}>
                  {item.type === "PLUS" ? "+" : "-"}{item.points.toLocaleString()}
                </div>
              </div>
            ))}
            {!loyaltyData?.history?.length && (
              <div className="col-span-full text-center py-6 text-gray-400 text-xs italic font-medium bg-gray-50/30 rounded-xl border border-dashed border-gray-200">
                Chưa có biến động điểm thưởng
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
