import { Layout } from "antd";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout className="min-h-screen flex flex-row">
      <AdminSidebar />
      <Layout className="md:ml-[260px] transition-all bg-gray-50 flex-grow">
        <AdminHeader />
        <Layout.Content className="p-8">
          {children}
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
