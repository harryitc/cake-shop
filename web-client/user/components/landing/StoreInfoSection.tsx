"use client";

import { MapPin, Clock, Phone, Mail } from "lucide-react";

export function StoreInfoSection() {
  return (
    <section className="py-24 bg-gray-50/50">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="bg-white rounded-[48px] overflow-hidden shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col lg:flex-row">
          <div className="flex-1 p-10 md:p-16">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-10 tracking-tight">Liên Hệ</h2>
            
            <div className="space-y-8">
              {[
                { icon: <MapPin />, title: "Địa chỉ", content: "123 Đường Bánh Ngọt, Quận 1, TP. Hồ Chí Minh" },
                { icon: <Clock />, title: "Giờ mở cửa", content: "08:00 - 22:00 (Hàng ngày)" },
                { icon: <Phone />, title: "Hotline", content: "0123 456 789" },
                { icon: <Mail />, title: "Email", content: "hello@cakeshop.com" },
              ].map((item, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className="w-12 h-12 bg-[#533afd]/5 rounded-2xl flex items-center justify-center text-[#533afd] flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#533afd] uppercase tracking-widest mb-1">{item.title}</h4>
                    <p className="text-lg font-bold text-gray-700">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 p-8 bg-[#533afd] rounded-[32px] text-white">
              <h4 className="text-xl font-black mb-2">Khu Vực Giao Hàng</h4>
              <p className="text-indigo-100 font-medium">Chúng tôi giao hàng trong bán kính 10km quanh cửa hàng để đảm bảo chất lượng bánh tốt nhất.</p>
            </div>
          </div>

          <div className="flex-1 min-h-[400px]">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.460232428343!2d106.6974151!3d10.771783!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3f45fca357%3A0x11714d3f6634d9a5!2zRGluaCDEkOG7mWMgTOG6rXA!5e0!3m2!1svi!2s!4v1650000000000!5m2!1svi!2s" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale hover:grayscale-0 transition-all duration-700"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
