"use client";

import { useWishlist } from "../../../hooks/use-wishlist";
import { CakeCard } from "../../../modules/cakes/components/CakeCard";
import { Empty, Spin, Breadcrumb } from "antd";
import { HeartFilled, HomeOutlined, ShoppingOutlined } from "@ant-design/icons";
import { useMeQuery } from "../../../modules/auth/hooks";
import { mapCakeToModel } from "../../../modules/cakes/mapper";
import Link from "next/link";

export default function WishlistPage() {
  const { data: user, isLoading: userLoading } = useMeQuery();
  const { wishlist, isLoading: wishlistLoading } = useWishlist();

  if (userLoading || wishlistLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spin size="large" tip="Đang tải danh sách yêu thích..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-md mx-auto bg-white p-10 rounded-3xl border border-gray-100 shadow-sm">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="flex flex-col gap-4">
                <p className="text-xl font-black text-gray-800 uppercase tracking-tighter">Đăng nhập ngay</p>
                <p className="text-gray-500 font-medium">Vui lòng đăng nhập để xem và quản lý danh sách yêu thích của bạn.</p>
                <Link href="/login" className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 mt-2">
                  ĐĂNG NHẬP
                </Link>
              </div>
            }
          />
        </div>
      </div>
    );
  }

  const favoriteCakes = wishlist?.cakes || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-8">
        <Breadcrumb
          items={[
            { title: <Link href="/"><HomeOutlined className="mr-1" /> Trang chủ</Link> },
            { title: <Link href="/cakes"><ShoppingOutlined className="mr-1" /> Thực đơn</Link> },
            { title: <span className="text-indigo-600 font-black">Yêu thích</span> },
          ]}
          className="bg-white/50 backdrop-blur px-4 py-2 rounded-xl inline-flex border border-gray-50 shadow-sm"
        />
      </div>

      {/* Header Section */}
      <div className="mb-10 flex flex-col sm:flex-row justify-between items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-red-50 p-2 rounded-xl">
              <HeartFilled className="text-red-500 text-2xl" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">
              Yêu Thích
            </h1>
          </div>
          <p className="text-gray-400 font-medium ml-1">
            Bạn đang lưu giữ <span className="text-red-500 font-bold">{favoriteCakes.length}</span> món quà ngọt ngào trong danh sách.
          </p>
        </div>
        
        {favoriteCakes.length > 0 && (
          <Link href="/cakes" className="text-xs font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
            Khám phá thêm bánh mới →
          </Link>
        )}
      </div>

      {favoriteCakes.length === 0 ? (
        <div className="bg-white rounded-[40px] border border-gray-100 py-24 text-center shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div className="flex flex-col gap-3">
                  <p className="text-2xl font-black text-gray-800 tracking-tight">Danh sách đang trống</p>
                  <p className="text-gray-400 font-medium max-w-xs mx-auto">Hãy dành chút thời gian để chọn lựa những chiếc bánh tuyệt vời nhất cho riêng mình!</p>
                  <Link href="/cakes" className="mt-6 bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 inline-block mx-auto uppercase tracking-wider">
                    Bắt đầu mua sắm ngay
                  </Link>
                </div>
              }
            />
          </div>
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-1000"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-50 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-1000"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {favoriteCakes.map((cake: any) => (
            <CakeCard 
              key={cake._id} 
              cake={mapCakeToModel(cake)} 
            />
          ))}
        </div>
      )}

      {/* Recommended Section (Optional Placeholder) */}
      {favoriteCakes.length > 0 && (
        <div className="mt-20 p-10 bg-indigo-900 rounded-[40px] text-white relative overflow-hidden group shadow-2xl shadow-indigo-200">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-black tracking-tighter mb-2 italic">Gợi ý cho ngày hôm nay?</h2>
              <p className="text-indigo-200 font-medium max-w-md">Các chuyên gia làm bánh của chúng tôi luôn sẵn sàng phục vụ những yêu cầu đặc biệt nhất từ bạn.</p>
            </div>
            <Link href="/cakes" className="bg-white text-indigo-900 px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-lg">
              Xem thực đơn đầy đủ
            </Link>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-800 rounded-full blur-3xl opacity-40 -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-1000"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-400 rounded-full blur-3xl opacity-20 -ml-10 -mb-10 group-hover:scale-150 transition-transform duration-1000"></div>
        </div>
      )}
    </div>
  );
}
