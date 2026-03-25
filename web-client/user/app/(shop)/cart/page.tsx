import { CartTable } from "@/modules/cart/components/CartTable";

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8">Giỏ Hàng Của Bạn</h1>
        <CartTable />
      </div>
    </div>
  );
}
