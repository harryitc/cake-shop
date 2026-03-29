"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useMeQuery } from "../hooks";
import { Spin } from "antd";

import { authStorage } from "@/lib/http";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: user, isLoading, isError } = useMeQuery({
    enabled: isMounted && 
             !!authStorage.getToken() &&
             !pathname.includes("/login") && 
             !pathname.includes("/forgot-password") && 
             !pathname.includes("/reset-password"),
  });

  useEffect(() => {
    if (isMounted) {
      const token = authStorage.getToken();
      
      // Nếu không có token và không ở trang login/forgot/reset
      if (!token && !pathname.includes("/login") && !pathname.includes("/forgot-password") && !pathname.includes("/reset-password")) {
        router.push("/admin/login");
        return;
      }

      // Nếu đã có user nhưng không phải admin
      if (user && user.role !== "admin") {
        authStorage.removeToken();
        router.push("/admin/login");
        return;
      }

      // Nếu API trả về lỗi (401)
      if (isError) {
        router.push("/admin/login");
        return;
      }
    }
  }, [isMounted, user, isError, pathname, router]);

  const token = authStorage.getToken();
  const isPublicRoute = pathname.includes("/login") || pathname.includes("/forgot-password") || pathname.includes("/reset-password");

  // Trong khi đang check auth hoặc nếu không có token trên route cần bảo vệ
  if (!isMounted || (isLoading && token) || (!token && !isPublicRoute)) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Spin size="large" />
          <p className="text-gray-500 font-medium animate-pulse">Đang xác thực quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Nếu có token nhưng useMeQuery lỗi
  if (token && isError && !isPublicRoute) {
    return null; // Để useEffect thực hiện redirect
  }

  return <>{children}</>;
};
