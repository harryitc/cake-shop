"use client";

import { ShoppingCart, ClipboardCheck, Truck } from "lucide-react";

const steps = [
  {
    icon: <ShoppingCart className="w-10 h-10 text-[#533afd]" />,
    title: "Chọn Món",
    description: "Khám phá thực đơn đa dạng và chọn những chiếc bánh ưng ý nhất cho bữa tiệc của bạn.",
  },
  {
    icon: <ClipboardCheck className="w-10 h-10 text-[#533afd]" />,
    title: "Xác Nhận Đơn",
    description: "Kiểm tra lại giỏ hàng, điền thông tin giao hàng và chọn phương thức thanh toán phù hợp.",
  },
  {
    icon: <Truck className="w-10 h-10 text-[#533afd]" />,
    title: "Nhận Hàng",
    description: "Đội ngũ của chúng tôi sẽ giao bánh đến tận nơi nhanh chóng, đảm bảo bánh luôn tươi mới.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-gray-50/50">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Quy Trình Đặt Bánh</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">
            Chỉ với 3 bước đơn giản để nhận ngay những chiếc bánh ngọt ngào tại nhà.
          </p>
          <div className="w-20 h-1.5 bg-[#533afd] mx-auto rounded-full mt-8 opacity-80"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-1/4 left-0 w-full h-0.5 border-t-2 border-dashed border-gray-200 -z-0"></div>

          {steps.map((step, index) => (
            <div key={index} className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-8 border border-gray-100 group-hover:-translate-y-2 transition-transform duration-300 relative">
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-[#533afd] text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                  {index + 1}
                </div>
                {step.icon}
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-4 tracking-tight">{step.title}</h3>
              <p className="text-gray-500 leading-relaxed font-medium">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
