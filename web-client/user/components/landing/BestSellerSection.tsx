"use client";

import { ProductCard } from "./ProductCard";

const products = [
  {
    name: "Bánh Kem Dâu Tây Thượng Hạng",
    price: 350000,
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&auto=format&fit=crop&q=60",
    category: "Bánh Kem",
  },
  {
    name: "Tiramisu Ý Cổ Điển",
    price: 280000,
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop&q=60",
    category: "Best Seller",
  },
  {
    name: "Bánh Sừng Bò Trứng Muối",
    price: 45000,
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60",
    category: "Bánh Mì",
  },
  {
    name: "Macaron Pháp Đa Sắc",
    price: 120000,
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&auto=format&fit=crop&q=60",
    category: "Tráng Miệng",
  },
];

export function BestSellerSection() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Best Seller</h2>
            <p className="text-gray-500 text-lg font-medium">
              Khám phá những hương vị được yêu thích nhất tại CakeShop. 
              Mỗi chiếc bánh là một tác phẩm nghệ thuật tâm huyết.
            </p>
          </div>
          <div>
            <button className="px-8 py-4 bg-gray-50 text-gray-900 border-2 border-gray-100 rounded-2xl font-bold hover:bg-white hover:border-[#533afd] hover:text-[#533afd] transition-all">
              Xem Tất Cả Menu
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <ProductCard key={index} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
}
