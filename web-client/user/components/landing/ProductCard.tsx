"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  name: string;
  price: number;
  image: string;
  category: string;
}

export function ProductCard({ name, price, image, category }: ProductCardProps) {
  return (
    <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 group relative">
      <div className="relative aspect-square overflow-hidden rounded-[24px] mb-6">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold text-[#533afd] border border-white shadow-sm">
            {category}
          </span>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#533afd] transition-colors">{name}</h3>
        <div className="flex items-center justify-between mt-6">
          <span className="text-2xl font-black text-[#533afd]">
            {price.toLocaleString('vi-VN')}đ
          </span>
          <Button className="w-12 h-12 rounded-2xl bg-[#533afd] hover:bg-[#341ac9] p-0 flex items-center justify-center shadow-lg shadow-indigo-100 transition-all hover:scale-105 active:scale-95">
            <Plus className="w-6 h-6 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
}
