"use client";

import { Layout, Dropdown, Button, Avatar } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useMeQuery } from "@/modules/auth/hooks";
import { getAvatarUrl } from "@/lib/utils";

export const AdminHeader = () => {
  const router = useRouter();
  const { data: user } = useMeQuery();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/admin/login";
  };

  const userMenuItems = [
    {
      key: "logout",
      label: <span className="text-red-600 font-bold">Đăng xuất</span>,
      icon: <LogoutOutlined className="text-red-600" />,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout.Header className="bg-white h-20 px-8 flex items-center justify-between border-b border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)] sticky top-0 z-10 w-full">
      <div className="text-2xl font-black text-gray-800 tracking-tight">Dashboard Quản Trị</div>
      <div className="flex items-center gap-4">
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
          <div className="h-11 px-4 flex items-center gap-3 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-100 transition-colors cursor-pointer">
            <Avatar 
              src={getAvatarUrl(user?.avatar_url)} 
              icon={<UserOutlined />} 
              className="bg-indigo-100 text-indigo-600"
            />
            <span className="font-bold text-indigo-700">{user?.full_name || "Admin"}</span>
          </div>
        </Dropdown>
      </div>
    </Layout.Header>
  );
};
