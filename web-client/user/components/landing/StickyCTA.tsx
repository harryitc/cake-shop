"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";

export function StickyCTA() {
  return (
    <div className="md:hidden fixed bottom-6 left-6 right-6 z-[100]">
      <Link href="/cakes" className="flex items-center justify-center gap-3 w-full bg-[#533afd] text-white py-5 rounded-[24px] font-black text-lg shadow-2xl shadow-indigo-300 ring-4 ring-white active:scale-95 transition-all">
        <ShoppingBag className="w-6 h-6" />
        Đặt Món Ngay 🍰
      </Link>
    </div>
  );
}
