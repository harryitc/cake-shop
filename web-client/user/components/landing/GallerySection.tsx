"use client";

import Image from "next/image";

const images = [
  "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1519340333755-56e9c1d04579?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1542826438-bd32f43d626f?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1514517604298-cf80e0fb7f1e?w=500&auto=format&fit=crop&q=60",
];

export function GallerySection() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Thư Viện Ảnh</h2>
          <p className="text-gray-500 text-lg font-medium">Khoảnh khắc ngọt ngào tại CakeShop.</p>
          <div className="w-20 h-1.5 bg-[#533afd] mx-auto rounded-full mt-8 opacity-80"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-[24px] md:rounded-[40px] group border-4 border-gray-50 hover:border-[#533afd]/20 transition-all duration-500">
              <Image 
                src={img} 
                alt="Gallery" 
                fill 
                className="object-cover group-hover:scale-110 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                <span className="text-white font-black text-xl scale-90 group-hover:scale-100 transition-transform duration-500">View</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
