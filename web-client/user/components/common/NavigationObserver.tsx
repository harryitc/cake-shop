"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { setGlobalRouter } from "@/lib/navigation";

/**
 * Component "quan sát" Router instance và đăng ký nó với hệ thống điều hướng toàn cục.
 * Phải được render trong Providers hoặc RootLayout (Client Component).
 */
export const NavigationObserver = () => {
  const router = useRouter();

  useEffect(() => {
    // Đăng ký router instance hiện tại khi component mount
    setGlobalRouter(router);
  }, [router]);

  // Component này không render bất cứ gì ra UI
  return null;
};
