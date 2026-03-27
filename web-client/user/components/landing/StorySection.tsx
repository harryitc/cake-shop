"use client";

import Image from "next/image";

export function StorySection() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="flex-1 relative">
            <div className="relative z-10 rounded-[48px] overflow-hidden shadow-2xl shadow-indigo-100 rotate-2 group hover:rotate-0 transition-transform duration-700">
              <Image 
                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop&q=60" 
                alt="Our Bakery" 
                width={800} 
                height={1000}
                className="object-cover"
              />
            </div>
            {/* Decoration */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-pink-50 rounded-full blur-3xl -z-0"></div>
            <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-[#533afd]/5 rounded-full blur-3xl -z-0"></div>
          </div>

          <div className="flex-1">
            <span className="text-[#533afd] font-black uppercase tracking-[0.3em] text-sm mb-6 inline-block">Câu Chuyện Của Chúng Tôi</span>
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-8 leading-tight tracking-tight">
              Sứ Mệnh <br/> <span className="text-[#533afd]">Lan Tỏa Niềm Vui</span>
            </h2>
            <p className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed mb-8">
              Mỗi chiếc bánh tại CakeShop không chỉ đơn thuần là một món tráng miệng, mà là tâm huyết, sự tỉ mỉ của những nghệ nhân làm bánh muốn gửi gắm đến khách hàng.
            </p>
            <div className="space-y-6">
              {[
                { title: "Nguyên liệu sạch", desc: "100% nguyên liệu tự nhiên, không chất bảo quản." },
                { title: "Công thức độc quyền", desc: "Hương vị tinh tế, khác biệt so với thị trường." },
                { title: "Làm bánh thủ công", desc: "Sự tỉ mỉ trong từng đường nét trang trí." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#533afd]/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-[#533afd]"></div>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-gray-900 text-lg mb-1">{item.title}</h4>
                    <p className="text-gray-500 font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
