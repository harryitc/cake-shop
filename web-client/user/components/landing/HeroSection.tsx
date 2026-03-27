"use client";

import Link from "next/image";
import NextLink from "next/link";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative w-full h-screen min-h-[600px] flex items-center justify-start overflow-hidden bg-gray-900">
      {/* BACKGROUND - Phủ kín hoàn toàn */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1600&auto=format&fit=crop&q=80"
          alt="Delicious Cake Background"
          fill
          priority
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>
      
      {/* CONTENT - Thêm padding top (pt-28) để không bị Header che */}
      <div className="relative z-10 container mx-auto px-6 md:px-16 pt-28 flex items-center h-full max-w-7xl">
        <div className="max-w-xl">
          {/* Headline Section - Font size tinh tế */}
          <h1 className="text-white text-4xl md:text-5xl font-black leading-[1.1] tracking-tight mb-4 drop-shadow-md">
            Lưu Giữ <br/> Khoảnh Khắc
          </h1>
          
          {/* Highlight Box - Thon gọn và thanh thoát hơn */}
          <div className="inline-block bg-white rounded-[24px] px-8 py-8 md:px-10 md:py-8 mb-8 shadow-2xl">
            <h2 className="text-[#533afd] text-4xl md:text-6xl font-black leading-[1] tracking-tighter uppercase">
              Ngọt Ngào <br/> Nhất
            </h2>
          </div>
          
          {/* Subtext - Cỡ chữ chuẩn cho sự sang trọng */}
          <p className="text-white/95 text-base md:text-lg font-bold max-w-sm leading-relaxed mb-10 drop-shadow-sm">
            Khám phá bộ sưu tập bánh kem thủ công tinh tế, thay bạn gửi trao thông điệp yêu thương trọn vẹn nhất.
          </p>
          
          {/* CTA Group - Standard sizing */}
          <div className="flex flex-wrap gap-8 items-center">
            <NextLink href="/cakes" className="group flex items-center gap-2">
              <span className="text-white text-xl font-black group-hover:underline flex items-center gap-2">
                Xem Thực Đơn <span className="bg-white px-2 py-0.5 rounded text-[#533afd] text-sm">🍰</span>
              </span>
            </NextLink>
            
            <NextLink href="/register" className="px-8 py-3.5 bg-white/5 backdrop-blur-md border border-white/20 text-white rounded-2xl text-base font-black hover:bg-white/10 transition-all text-center min-w-[180px]">
              Đăng ký ngay
            </NextLink>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
        <span className="text-[9px] font-black uppercase tracking-[0.6em]">CUỘN XUỐNG</span>
        <div className="w-px h-8 bg-gradient-to-b from-white to-transparent opacity-30"></div>
      </div>
    </section>
  );
}
