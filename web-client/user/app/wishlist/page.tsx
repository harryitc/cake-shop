"use client";

import { useWishlist } from "../../hooks/use-wishlist";
import { CakeCard } from "../../modules/cakes/components/CakeCard";
import { Empty, Spin } from "antd";
import { HeartFilled } from "@ant-design/icons";
import { useMeQuery } from "../../modules/auth/hooks";

export default function WishlistPage() {
  const { data: user, isLoading: userLoading } = useMeQuery();
  const { wishlist, isLoading: wishlistLoading } = useWishlist();

  if (userLoading || wishlistLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div className="flex flex-col gap-4">
              <p className="text-xl font-medium text-gray-600">Vui lòng đăng nhập để xem danh sách yêu thích</p>
              <a href="/login" className="bg-indigo-600 text-white px-6 py-2 rounded-lg mx-auto hover:bg-indigo-700 transition-colors">
                Đăng nhập ngay
              </a>
            </div>
          }
        />
      </div>
    );
  }

  const favoriteCakes = wishlist?.cakes || [];

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <HeartFilled className="text-red-500 text-3xl" />
        <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tighter">
          Danh sách yêu thích
        </h1>
        <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-sm font-bold">
          {favoriteCakes.length} sản phẩm
        </span>
      </div>

      {favoriteCakes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-20 text-center">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="flex flex-col gap-2">
                <p className="text-lg text-gray-500">Danh sách yêu thích của bạn đang trống</p>
                <p className="text-sm text-gray-400">Hãy thêm những chiếc bánh bạn yêu thích để xem lại sau nhé!</p>
                <a href="/cakes" className="text-indigo-600 font-bold mt-4 hover:underline">
                  Khám phá các loại bánh →
                </a>
              </div>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {favoriteCakes.map((cake: any) => (
            <CakeCard 
              key={cake._id} 
              cake={{
                ...cake,
                id: cake._id,
                imageUrl: cake.image_url,
                formattedPrice: cake.price.toLocaleString('vi-VN') + 'đ',
                tags: [] // Schema Category chưa có tags, để trống hoặc map từ category
              } as any} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
