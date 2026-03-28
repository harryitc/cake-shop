"use client";

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
  return (
    <AuthGuard>
      <Layout className="min-h-screen">
        <AdminSidebar />
        <Layout className="transition-all bg-gray-50 flex flex-col min-h-screen">
          <AdminHeader />
          <Content className="p-8">
            {children}
          </Content>
        </Layout>
      </Layout>
    </AuthGuard>
  );
}
