"use client";

import { Layout, Menu } from "antd";
import { ShopOutlined, HistoryOutlined, UserOutlined, DashboardOutlined, TagsOutlined, StarOutlined, GiftOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const AdminSidebar = ({
  collapsed,
  onCollapse,
}: {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}) => {
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
      key: "/admin/categories",
      icon: <TagsOutlined />,
      label: <Link href="/admin/categories">Quản lý Danh mục</Link>,
    },
    {
      key: "/admin/coupons",
      icon: <GiftOutlined />,
      label: <Link href="/admin/coupons">Quản lý Mã giảm giá</Link>,
    },
    {
      key: "/admin/reviews",
      icon: <StarOutlined />,
      label: <Link href="/admin/reviews">Quản lý Đánh giá</Link>,
    },
    {
      key: "/admin/orders",
      icon: <ShoppingCartOutlined />,
      label: <Link href="/admin/orders">Quản lý Đơn hàng</Link>,
    },
    {
      key: "customers-group",
      icon: <UserOutlined />,
      label: "Quản lý khách hàng",
      children: [
        {
          key: "/admin/customers",
          label: <Link href="/admin/customers">Danh sách khách hàng</Link>,
        },
        {
          key: "/admin/loyalty-config",
          label: <Link href="/admin/loyalty-config">Cấu hình Loyalty</Link>,
        },
      ],
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
      collapsed={collapsed}
      onCollapse={onCollapse}
      className="border-r border-gray-100 shadow-sm !z-30 transition-all duration-300"
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div className="h-20 flex items-center justify-center border-b border-gray-100 bg-white overflow-hidden whitespace-nowrap px-4">
        <Link href="/admin/cakes" className="flex items-center gap-3">
          <div className="bg-[#533afd] text-white p-2 rounded-xl shadow-md min-w-[42px] h-[42px] flex items-center justify-center transition-all duration-300">
            <ShopOutlined className="text-[22px]" />
          </div>
          {!collapsed && (
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight animate-in fade-in slide-in-from-left-2 duration-300">
              Admin Portal
            </span>
          )}
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
