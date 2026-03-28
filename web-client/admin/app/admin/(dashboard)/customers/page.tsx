import CustomerTable from "@/modules/customers/components/CustomerTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý khách hàng | Admin Dashboard",
};


export default function CustomersPage() {
  return (
    <div className="p-6">
      <CustomerTable />
    </div>
  );
}
