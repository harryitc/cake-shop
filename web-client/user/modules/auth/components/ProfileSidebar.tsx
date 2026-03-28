"use client";

import { cn, getAvatarUrl } from "@/lib/utils";
import { 
  UserOutlined, 
  ShoppingOutlined, 
  LockOutlined, 
  GiftOutlined, 
  LogoutOutlined,
  EnvironmentOutlined
} from "@ant-design/icons";
import { Avatar, Button } from "antd";

interface ProfileSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: any;
}

export const ProfileSidebar = ({ activeTab, onTabChange, user }: ProfileSidebarProps) => {
  const menuItems = [
    { key: "overview", label: "Tổng quan", icon: <UserOutlined /> },
    { key: "orders", label: "Đơn hàng của tôi", icon: <ShoppingOutlined /> },
    { key: "address", label: "Sổ địa chỉ", icon: <EnvironmentOutlined /> },
    { key: "rewards", label: "Ưu đãi của tôi", icon: <GiftOutlined /> },
    { key: "security", label: "Bảo mật", icon: <LockOutlined /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  };

  return (
    <div className="bg-white/80 backdrop-blur-md border border-white/50 rounded-3xl p-6 shadow-xl shadow-gray-200/50 flex flex-col h-full">
      <div className="flex flex-col items-center mb-10">
        <div className="relative p-1 bg-gradient-to-tr from-[#D4AF37] to-[#F1B24A] rounded-full shadow-lg">
           <Avatar 
             size={100} 
             src={getAvatarUrl(user?.avatar_url)} 
             className="border-4 border-white"
             icon={<UserOutlined />}
           />
        </div>

        <h3 className="mt-3 font-black text-lg text-gray-800 tracking-tight">{user?.full_name || "Khách hàng"}</h3>
        <span className="text-gray-400 text-xs font-semibold">{user?.email}</span>
      </div>

      <nav className="flex-1 flex flex-col gap-1.5">
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onTabChange(item.key)}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 font-bold text-xs group",
              activeTab === item.key 
                ? "bg-gradient-to-r from-[#D4AF37] to-[#F1B24A] text-white shadow-md shadow-[#D4AF37]/20" 
                : "text-gray-500 hover:bg-gray-50 hover:text-[#D4AF37]"
            )}
          >
            <span className={cn(
              "text-base transition-transform duration-300 group-hover:scale-110",
              activeTab === item.key ? "text-white" : "text-gray-400 group-hover:text-[#D4AF37]"
            )}>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <Button 
          type="text" 
          danger 
          icon={<LogoutOutlined />} 
          onClick={handleLogout}
          className="w-full justify-start h-10 rounded-lg font-bold flex items-center gap-3 text-xs text-gray-500 hover:bg-red-50"
        >
          Đăng xuất
        </Button>
      </div>
    </div>
  );
};
