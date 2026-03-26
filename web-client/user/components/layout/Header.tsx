"use client";

import Link from "next/link";
import { Badge, Button, Dropdown } from "antd";
import { ShoppingCartOutlined, UserOutlined, ShopOutlined, HistoryOutlined, LogoutOutlined } from "@ant-design/icons";
import { useCartQuery } from "@/modules/cart/hooks";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const Header = () => {
  const { data: cart } = useCartQuery();
  const router = useRouter();
  
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem("access_token"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setToken(null);
    router.push("/login");
  };

  const userMenuItems = [
    {
      key: "profile",
      label: <span className="font-medium text-gray-700">Hồ sơ của tôi</span>,
      icon: <UserOutlined />,
      onClick: () => router.push("/profile"),
    },
    {
      key: "orders",
      label: <span className="font-medium text-gray-700">Đơn hàng của tôi</span>,
      icon: <HistoryOutlined />,
      onClick: () => router.push("/orders"),
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      label: <span className="font-medium text-red-600">Đăng xuất</span>,
      icon: <LogoutOutlined className="text-red-600" />,
      onClick: handleLogout,
    },
  ];

  // TypeScript mapping specific to local structure
  const cartLocal: any = cart || { items: [] };
  const totalItems = cartLocal?.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] transition-all h-20 flex items-center">
      <div className="container mx-auto px-4 md:px-6 flex h-full items-center justify-between max-w-7xl">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="bg-[#533afd] text-white p-2 rounded-xl shadow-sm shadow-[#533afd]/20 group-hover:-rotate-6 group-hover:scale-105 transition-all duration-300">
            <ShopOutlined className="text-2xl" />
          </div>
          <span className="text-[22px] font-black text-gray-900 tracking-tight ml-1">
            CakeShop
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-8 items-center text-[15px] font-semibold text-gray-500">
            <Link href="/" className="hover:text-[#533afd] transition-colors">Trang chủ</Link>
            <Link href="/cakes" className="hover:text-[#533afd] transition-colors">Thực Đơn</Link>
          </nav>
          
          <div className="flex items-center gap-4 border-l border-gray-200/80 pl-4 md:pl-6 ml-2 md:ml-4">
            <Link href="/cart">
              <Badge count={totalItems} size="default" color="#533afd" className="hover:scale-110 transition-transform">
                <Button type="text" shape="circle" size="large" icon={<ShoppingCartOutlined className="text-[20px] text-gray-700" />} className="bg-gray-50 hover:bg-gray-100 border border-gray-100/80" />
              </Badge>
            </Link>

            {token ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow trigger={['click']}>
                <Button type="text" shape="circle" size="large" icon={<UserOutlined className="text-[18px] text-gray-700" />} className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 transition-colors" />
              </Dropdown>
            ) : (
              <div className="flex gap-3">
                <Button type="default" className="hidden sm:inline-block font-bold border-gray-200 text-gray-600 rounded-lg h-[40px] px-5 hover:bg-gray-50" onClick={() => router.push("/login")}>
                  Đăng nhập
                </Button>
                <Button type="primary" className="font-bold bg-[#533afd] hover:bg-[#402fe3] shadow-[0_4px_10px_-2px_rgba(83,58,253,0.3)] rounded-lg h-[40px] px-6 transition-all hover:-translate-y-0.5" onClick={() => router.push("/register")}>
                  Đăng ký
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
