"use client";

import Link from "next/link";
import { Badge, Dropdown, Avatar } from "antd";
import { ShoppingCartOutlined, UserOutlined, ShopOutlined, HeartOutlined, StarOutlined, CrownOutlined } from "@ant-design/icons";
import { useCartQuery } from "@/modules/cart/hooks";
import { useLoyaltyQuery } from "@/modules/loyalty/hooks";
import { useMeQuery } from "@/modules/auth/hooks";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAvatarUrl } from "@/lib/utils";
import { ICartResponse } from "@/modules/cart/types";
import { authStorage } from "@/lib/http";

export const Header = () => {
  const { data: cart } = useCartQuery();
  const { data: loyalty } = useLoyaltyQuery();
  const { data: user } = useMeQuery();
  const router = useRouter();
  const pathname = usePathname();
  const [token, setToken] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  // Chỉ áp dụng hiệu ứng trong suốt ở Trang chủ khi chưa cuộn
  const isHome = pathname === "/";
  const isTransparent = isHome && !scrolled;

  useEffect(() => {
    setToken(authStorage.getToken());
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    authStorage.removeToken();
    setToken(null);
    window.location.href = "/login";
  };

  const getRankColor = (rank?: string) => {
    switch (rank) {
      case "SILVER": return "#94a3b8"; // Slate 400
      case "GOLD": return "#f59e0b";   // Amber 500
      case "DIAMOND": return "#06b6d4"; // Cyan 500
      default: return "#ea580c";       // Orange 600 (Bronze)
    }
  };

  const userMenuItems = [
    { 
      key: "loyalty-info", 
      label: (
        <div className="px-1 py-2 border-b border-gray-50 min-w-[160px]">
          <div className="flex items-center gap-2 mb-1">
            <CrownOutlined style={{ color: getRankColor(loyalty?.rank) }} />
            <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: getRankColor(loyalty?.rank) }}>
              Thành viên {loyalty?.rank || "BRONZE"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <StarOutlined className="text-amber-500 text-xs" />
            <span className="text-xs font-bold text-gray-700">{(loyalty?.loyalty_points || 0).toLocaleString()} <span className="text-[9px] text-gray-400 font-normal uppercase">điểm</span></span>
          </div>
        </div>
      ),
      disabled: true,
    },
    { key: "profile", label: "Hồ sơ của tôi", onClick: () => router.push("/profile") },
    { key: "orders", label: "Đơn hàng đã mua", onClick: () => router.push("/orders") },
    { key: "divider", type: 'divider' as const },
    { key: "logout", label: "Đăng xuất", danger: true, onClick: handleLogout },
  ];

  const cartLocal = (cart as ICartResponse) || { items: [], total: 0 };
  const totalItems = cartLocal.items.reduce((acc, item) => acc + item.quantity, 0);

  // Header styles based on state
  const headerClasses = `fixed top-0 left-0 w-full z-[100] transition-all duration-300 h-20 flex items-center ${
    isTransparent ? "bg-transparent !text-white" : "bg-white shadow-md !text-gray-900"
  }`;

  const logoClasses = isTransparent ? "!text-white" : "!text-[#533afd]";
  const navItemClasses = isTransparent ? "!text-white hover:opacity-80" : "text-gray-600 hover:text-[#533afd]";
  const iconClasses = isTransparent ? "!text-white" : "text-gray-600";
  const loginBtnClasses = isTransparent 
    ? "!text-white !border-white/30 hover:bg-white hover:text-[#533afd]" 
    : "text-[#533afd] border-[#533afd]/20 bg-[#533afd]/5 hover:bg-[#533afd] hover:text-white";

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
          
          <div className={`flex items-center gap-5 border-l ${isTransparent ? 'border-white/20' : 'border-gray-100'} pl-6`}>
            <Link href="/wishlist" className={`transition-all ${iconClasses} hover:!text-red-500`}>
              <HeartOutlined className="text-lg" />
            </Link>
            <Link href="/cart" className={`transition-all ${iconClasses} hover:!text-[#533afd]`}>
              <Badge count={totalItems} size="small" offset={[5, -2]} color="#533afd">
                <ShoppingCartOutlined className="text-xl" />
              </Badge>
            </Link>
            {token ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
                <div className="cursor-pointer hover:opacity-80 transition-all">
                  <Avatar 
                    size="small" 
                    src={getAvatarUrl(user?.avatar_url)} 
                    icon={<UserOutlined />} 
                    className="border border-indigo-100 shadow-sm"
                  />
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
