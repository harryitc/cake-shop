"use client";

import { useCartQuery } from "@/modules/cart/hooks";
import { CheckoutPageContent } from "@/modules/orders/components/CheckoutPageContent";
import { Skeleton, Result, Button } from "antd";
import { useRouter } from "next/navigation";
import { ShoppingCartOutlined } from "@ant-design/icons";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: cart, isLoading, isError } = useCartQuery();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Skeleton active paragraph={{ rows: 10 }} />
        </div>
      </div>
    );
  }

  if (isError || !cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Result
          status="warning"
          title="Giỏ hàng của bạn đang trống"
          subTitle="Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán."
          extra={
            <Button 
              type="primary" 
              icon={<ShoppingCartOutlined />} 
              onClick={() => router.push("/cakes")}
              className="bg-indigo-600 h-12 px-8 rounded-xl font-bold"
            >
              Quay lại mua sắm
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex items-center gap-3">
             <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <ShoppingCartOutlined className="text-white text-2xl" />
             </div>
             <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight m-0">Thanh toán</h1>
                <p className="text-gray-500 font-medium m-0">Vui lòng kiểm tra lại thông tin đơn hàng của bạn</p>
             </div>
          </div>
          
          <CheckoutPageContent 
            totalPrice={cart.total} 
            items={cart.items} 
          />
        </div>
      </div>
    </div>
  );
}
