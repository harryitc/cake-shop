"use client";

import { Star, Quote } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    name: "Nguyễn Thu Hà",
    role: "Khách hàng thân thiết",
    content: "Bánh ở đây cực kỳ ngon, độ ngọt vừa phải và cốt bánh mềm mịn. Gia đình mình luôn đặt bánh sinh nhật tại CakeShop mỗi dịp đặc biệt.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=ha",
  },
  {
    name: "Trần Minh Quân",
    role: "Food Blogger",
    content: "Ấn tượng nhất là tốc độ giao hàng, bánh đến tay vẫn giữ nguyên hình dáng và độ lạnh cần thiết. Bao bì đóng gói rất chuyên nghiệp và tinh tế.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=quan",
  },
  {
    name: "Lê Mỹ Linh",
    role: "Khách hàng",
    content: "Nguyên liệu cao cấp là điều mình cảm nhận rõ nhất. Tiramisu ở đây có vị cà phê thơm nồng và lớp kem béo ngậy chuẩn vị Ý.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=linh",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-gray-50/50">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Khách Hàng Nói Gì?</h2>
          <p className="text-gray-500 text-lg font-medium">Hơn 10,000 đơn hàng mỗi tháng là minh chứng cho chất lượng tuyệt vời.</p>
          <div className="w-20 h-1.5 bg-[#533afd] mx-auto rounded-full mt-8 opacity-80"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <div key={index} className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
              <Quote className="absolute top-8 right-8 w-12 h-12 text-gray-50 opacity-10 group-hover:text-[#533afd] group-hover:opacity-20 transition-all" />
              
              <div className="flex gap-1 mb-6">
                {[...Array(item.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#533afd] text-[#533afd]" />
                ))}
              </div>

              <p className="text-gray-600 text-lg leading-relaxed italic mb-8 relative z-10">
                &quot;{item.content}&quot;
              </p>

              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 overflow-hidden rounded-2xl border-2 border-gray-50 group-hover:border-[#533afd]/20 transition-colors">
                  <Image src={item.avatar} alt={item.name} fill className="object-cover" />
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900 group-hover:text-[#533afd] transition-colors">{item.name}</h4>
                  <p className="text-sm text-gray-400 font-medium">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
