"use client";

import { useState } from "react";
import { Layout } from "antd";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { AuthGuard } from "@/modules/auth/components/AuthGuard";

const { Content } = Layout;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AuthGuard>
      <Layout className="min-h-screen">
        <AdminSidebar collapsed={collapsed} onCollapse={setCollapsed} />
        <Layout 
          className="transition-all duration-300 bg-gray-50 flex flex-col min-h-screen"
          style={{ marginLeft: collapsed ? 80 : 260 }}
        >
          <AdminHeader />
          <Content className="p-8">
            <div className="max-w-[1600px] mx-auto">
              {children}
            </div>
          </Content>
        </Layout>
      </Layout>
    </AuthGuard>
  );
}
