"use client";

import { ProfileContent } from "@/modules/auth/components/ProfileContent";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Spin } from "antd";

import { authStorage } from "@/lib/http";

export default function ProfilePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = authStorage.getToken();
    if (!token) {
      router.push("/login?redirect=/profile");
    } else {
      setChecking(false);
    }
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spin size="large" tip="Đang kiểm tra quyền truy cập..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileContent />
    </div>
  );
}
