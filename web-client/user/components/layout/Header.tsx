"use client";

import Link from "next/link";
import { Badge, Dropdown } from "antd";
import { ShoppingCartOutlined, UserOutlined, ShopOutlined, HeartOutlined } from "@ant-design/icons";
import { useCartQuery } from "@/modules/cart/hooks";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export const Header = () => {
  const { data: cart } = useCartQuery();
  const router = useRouter();
  const pathname = usePathname();
  const [token, setToken] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const isHome = pathname === "/";

  useEffect(() => {
    setToken(localStorage.getItem("access_token"));
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setToken(null);
    window.location.href = "/login";
  };

  const userMenuItems = [
    { key: "profile", label: "Hồ sơ của tôi", onClick: () => router.push("/profile") },
    { key: "orders", label: "Đơn hàng đã mua", onClick: () => router.push("/orders") },
    { key: "logout", label: "Đăng xuất", danger: true, onClick: handleLogout },
  ];

  const cartLocal: any = cart || { items: [] };
  const totalItems = cartLocal?.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;

  // Header styles based on route and scroll
  const headerClasses = isHome
    ? `fixed top-0 left-0 w-full z-[100] transition-all duration-300 h-20 flex items-center ${
        scrolled ? "bg-white shadow-md text-gray-800" : "bg-transparent text-white"
      }`
    : "sticky top-0 left-0 w-full z-[100] bg-white border-b border-gray-100 h-20 flex items-center text-gray-800 shadow-sm";

  const logoClasses = isHome && !scrolled ? "text-white" : "text-gray-900";
  const navItemClasses = isHome && !scrolled ? "text-white/80 hover:text-white" : "text-gray-500 hover:text-indigo-600";
  const iconClasses = isHome && !scrolled ? "text-white/80" : "text-gray-500";
  const loginBtnClasses = isHome && !scrolled 
    ? "text-white border-white/30 hover:bg-white hover:text-[#533afd]" 
    : "text-indigo-600 border-indigo-100 bg-indigo-50 hover:bg-indigo-600 hover:text-white";

  return (
    <header className={headerClasses}>
      <div className="container mx-auto px-6 md:px-12 flex h-full items-center justify-between max-w-7xl">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-[#533afd] text-white p-1.5 rounded-lg shadow-lg group-hover:scale-110 transition-transform">
            <ShopOutlined className="text-xl" />
          </div>
          <span className={`text-xl font-black tracking-tight drop-shadow-sm ${logoClasses}`}>CakeShop</span>
        </Link>

        {/* NAV & ACTIONS */}
        <div className="flex items-center gap-8">
          <nav className="hidden md:flex gap-8 items-center text-[12px] font-black uppercase tracking-[0.2em]">
            <Link href="/" className={`transition-colors ${navItemClasses}`}>Trang chủ</Link>
            <Link href="/cakes" className={`transition-colors ${navItemClasses}`}>Thực Đơn</Link>
          </nav>
          
          <div className={`flex items-center gap-5 border-l ${isHome && !scrolled ? 'border-white/20' : 'border-gray-100'} pl-6`}>
            <Link href="/wishlist" className={`${iconClasses} hover:text-red-500 transition-all`}>
              <HeartOutlined className="text-lg" />
            </Link>
            <Link href="/cart" className={`${iconClasses} hover:text-indigo-600 transition-all`}>
              <Badge count={totalItems} size="small" offset={[5, -2]} color="#533afd">
                <ShoppingCartOutlined className={`text-xl ${iconClasses} hover:text-indigo-600`} />
              </Badge>
            </Link>
            {token ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
                <div className={`w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center cursor-pointer border border-indigo-100 hover:border-indigo-300 transition-all`}>
                  <UserOutlined className="text-indigo-600" />
                </div>
              </Dropdown>
            ) : (
              <Link href="/login" className={`text-xs font-black uppercase tracking-widest border px-4 py-2 rounded-lg transition-all ${loginBtnClasses}`}>
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
