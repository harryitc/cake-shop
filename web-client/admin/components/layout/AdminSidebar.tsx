"use client";

import { Layout, Menu } from "antd";
import { ShopOutlined, HistoryOutlined, UserOutlined, DashboardOutlined } from "@ant-design/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const AdminSidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    {
      key: "/admin/dashboard",
      icon: <DashboardOutlined />,
      label: <Link href="/admin/dashboard">Bảng điều khiển</Link>,
    },
    {
      key: "/admin/cakes",
      icon: <ShopOutlined />,
      label: <Link href="/admin/cakes">Quản lý Bánh</Link>,
    },
    {
      key: "/admin/orders",
      icon: <HistoryOutlined />,
      label: <Link href="/admin/orders">Quản lý Đơn hàng</Link>,
    },
    {
      key: "/admin/profile",
      icon: <UserOutlined />,
      label: <Link href="/admin/profile">Hồ sơ cá nhân</Link>,
    },
  ];

  return (
    <Layout.Sider
      width={260}
      theme="light"
      collapsible
      className="border-r border-gray-100 shadow-sm fixed h-screen z-20 left-0 top-0"
    >
      <div className="h-20 flex items-center justify-center border-b border-gray-100 bg-white">
        <Link href="/admin/cakes" className="flex items-center gap-2">
          <div className="bg-[#533afd] text-white p-1.5 rounded-lg shadow-sm">
            <ShopOutlined className="text-xl" />
          </div>
          <span className="text-xl font-black text-gray-900 tracking-tight">Admin Portal</span>
        </Link>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[pathname]}
        items={menuItems}
        className="font-semibold text-gray-600 mt-4 border-none"
      />
    </Layout.Sider>
  );
};
