"use client";

import { OrderList } from "@/modules/orders/components/OrderList";

export const OrdersSection = () => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-1 shadow-lg shadow-gray-200/50 border border-white/50 overflow-hidden">
        <OrderList hideHeader={true} />
      </div>
    </div>
  );
};
