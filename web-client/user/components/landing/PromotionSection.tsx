"use client";

import { useEffect, useState } from "react";
import { Timer } from "lucide-react";

export function PromotionSection() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 12,
    minutes: 45,
    seconds: 30,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="relative overflow-hidden rounded-[40px] bg-[#533afd] p-10 md:p-20 text-white shadow-2xl shadow-indigo-200">
          {/* Abstract Decorations */}
          <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[300px] h-[300px] bg-pink-500/20 rounded-full blur-3xl"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="text-center lg:text-left">
              <span className="inline-block px-6 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-bold uppercase tracking-widest mb-6 border border-white/30">
                Ưu Đãi Đặc Biệt
              </span>
              <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                Giảm 20% Cho <br/> Đơn Hàng Đầu Tiên
              </h2>
              <p className="text-indigo-100 text-lg md:text-xl font-medium max-w-lg mb-10">
                Nhập mã <span className="text-white font-black underline decoration-pink-500 underline-offset-4">HELLO2026</span> để nhận ưu đãi. Miễn phí vận chuyển trong bán kính 3km.
              </p>
              <button className="px-12 py-5 bg-white text-[#533afd] rounded-2xl font-black text-lg shadow-xl shadow-indigo-900/20 hover:scale-105 active:scale-95 transition-all">
                Lấy Ưu Đãi Ngay
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 md:p-12 rounded-[32px] text-center">
              <div className="flex items-center justify-center gap-3 mb-8 text-indigo-100 font-bold uppercase tracking-widest">
                <Timer className="w-6 h-6" />
                Kết thúc sau
              </div>
              <div className="flex gap-4 md:gap-8">
                {[
                  { label: "Giờ", value: timeLeft.hours },
                  { label: "Phút", value: timeLeft.minutes },
                  { label: "Giây", value: timeLeft.seconds },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-white text-[#533afd] rounded-2xl flex items-center justify-center text-3xl md:text-5xl font-black shadow-lg mb-3">
                      {String(item.value).padStart(2, '0')}
                    </div>
                    <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-indigo-100">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
