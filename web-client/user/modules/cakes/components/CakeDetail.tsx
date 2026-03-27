"use client";

import { useCakeQuery, useCakeReviewsQuery } from "../hooks";
import { AddToCartBtn } from "../../cart/components/AddToCartBtn";
import { Skeleton, Breadcrumb, Rate, Avatar, List, Empty, Pagination, Tag, Divider, Radio, Space, Button, message } from "antd";
import Link from "next/link";
import { ArrowLeftOutlined, UserOutlined, InfoCircleOutlined, HeartOutlined, HeartFilled } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { useWishlist } from "../../../hooks/use-wishlist";
import { useMeQuery } from "../../auth/hooks";

const API_DOMAIN = process.env.NEXT_PUBLIC_API_DOMAIN || "http://localhost:5000";

export const CakeDetail = ({ id }: { id: string }) => {
  const [page, setPage] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const { data: cake, isLoading, isError } = useCakeQuery(id);
  const { data: reviewsData, isLoading: isLoadingReviews } = useCakeReviewsQuery(id, page);
  const { isLiked, toggleWishlist, isPending } = useWishlist();
  const { data: user } = useMeQuery();

  useEffect(() => {
    if (cake && cake.variants && cake.variants.length > 0) {
      setSelectedVariant(cake.variants[0]);
    }
  }, [cake]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Skeleton active avatar={{ shape: 'square', size: 400 }} paragraph={{ rows: 10 }} />
      </div>
    );
  }

  if (isError || !cake) {
    return <div className="p-16 text-center text-xl text-red-500 font-black bg-white rounded-3xl shadow-sm border border-red-50 mx-4 my-8">Sản phẩm không tồn tại!</div>;
  }

  const currentPrice = selectedVariant ? selectedVariant.price : cake.price;
  const currentStock = selectedVariant ? selectedVariant.stock : cake.stock;
  const formattedCurrentPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(currentPrice);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-10">
      <div className="mb-2">
        <Breadcrumb items={[
          { title: <Link href="/cakes" className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"><ArrowLeftOutlined className="text-xs" /> Quay lại danh mục</Link> },
          { title: <span className="text-gray-400 font-medium">{cake.name}</span> }
        ]} />
      </div>

      <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 md:p-12 flex flex-col md:flex-row gap-12 overflow-hidden relative">
        <div className="w-full md:w-1/2 relative group">
          <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
            {cake.tags.map((tag, idx) => (
              <span key={idx} className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-black text-indigo-600 shadow-sm border border-indigo-100 uppercase tracking-wider">
                {tag}
              </span>
            ))}
          </div>
          <img
            src={cake.imageUrl}
            alt={cake.name}
            className="w-full aspect-square rounded-[24px] object-cover shadow-2xl shadow-indigo-100/50 group-hover:scale-[1.02] transition-transform duration-500"
          />
        </div>

        <div className="w-full md:w-1/2 flex flex-col">
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {cake.categories?.map((cat, idx) => (
                <Tag key={idx} color="indigo" className="rounded-full px-3 py-0.5 border-none bg-indigo-50 text-indigo-500 font-bold uppercase text-[10px] tracking-widest">
                  {cat.name}
                </Tag>
              ))}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4">{cake.name}</h1>
            
            <div className="flex items-center gap-6 mb-2">
              <div className="flex items-center gap-2">
                <Rate disabled allowHalf value={cake.averageRating} className="text-lg text-amber-400" />
                <span className="text-gray-400 font-bold text-sm">({cake.reviewCount} đánh giá)</span>
              </div>
              <div className="h-4 w-px bg-gray-200"></div>
              <div className="text-gray-500 font-medium text-sm">
                Đã bán: <span className="text-gray-900 font-bold">120+</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 mb-8">
            <div className="flex items-baseline gap-4 mb-4">
              <span className="text-5xl font-black text-indigo-600 tracking-tighter">
                {formattedCurrentPrice}
              </span>
              {currentStock > 0 ? (
                <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider">
                  Sẵn có {currentStock} sản phẩm
                </span>
              ) : (
                <span className="text-red-600 bg-red-50 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider">
                  Tạm hết hàng
                </span>
              )}
            </div>

            {cake.variants && cake.variants.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200/50">
                <p className="text-gray-400 font-black text-[11px] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <InfoCircleOutlined className="text-indigo-400" /> Chọn kích thước
                </p>
                <Radio.Group 
                  value={selectedVariant?.size} 
                  onChange={(e) => setSelectedVariant(cake.variants.find(v => v.size === e.target.value))}
                  className="variant-selector w-full"
                >
                  <Space wrap size={12}>
                    {cake.variants.map((v, idx) => (
                      <Radio.Button 
                        key={idx} 
                        value={v.size}
                        disabled={v.stock === 0}
                        className={`rounded-xl h-12 flex items-center px-6 font-bold border-2 transition-all ${selectedVariant?.size === v.size ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-100'}`}
                      >
                        {v.size}
                      </Radio.Button>
                    ))}
                  </Space>
                </Radio.Group>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Trọng lượng</p>
               <p className="text-gray-800 font-bold mb-0">{cake.specifications.weight || "N/A"}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Số người ăn</p>
               <p className="text-gray-800 font-bold mb-0">{cake.specifications.servings || "N/A"}</p>
            </div>
          </div>

          <div className="mt-auto flex flex-col sm:flex-row gap-4">
            {currentStock > 0 ? (
              <AddToCartBtn 
                cakeId={cake.id} 
                variantId={selectedVariant?._id} 
                className="flex-grow h-16 rounded-[20px] bg-indigo-600 hover:bg-indigo-700 text-lg font-black shadow-xl shadow-indigo-200 border-none flex items-center justify-center gap-3"
              />
            ) : (
              <div className="w-full py-5 text-center bg-gray-100 text-gray-400 font-black rounded-[20px] cursor-not-allowed uppercase tracking-widest text-sm">
                Sản phẩm tạm thời hết hàng
              </div>
            )}
            <Button 
              className={`h-16 w-16 rounded-[20px] border-2 flex items-center justify-center transition-all ${isLiked(cake.id) ? 'border-red-500 text-red-500 bg-red-50' : 'border-indigo-100 text-indigo-600 hover:border-indigo-600'}`}
              loading={isPending}
              onClick={() => {
                if (!user) {
                  message.info("Vui lòng đăng nhập để lưu vào danh sách yêu thích");
                  return;
                }
                toggleWishlist(cake.id);
              }}
            >
               {isLiked(cake.id) ? <HeartFilled className="text-2xl" /> : <HeartOutlined className="text-2xl" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 md:p-12">
            <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
              <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
              Khám phá hương vị
            </h2>
            <div className="prose prose-indigo max-w-none">
              <p className="text-gray-600 text-lg leading-relaxed mb-10 whitespace-pre-wrap">
                {cake.description || "Chưa có mô tả chi tiết cho sản phẩm này."}
              </p>
              
              {cake.ingredients.length > 0 && (
                <div className="mt-8">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    Thành phần chính:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {cake.ingredients.map((ing, idx) => (
                      <Tag key={idx} className="rounded-lg px-4 py-1.5 bg-gray-50 border-gray-100 text-gray-600 font-medium">
                        {ing}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section Đánh giá */}
          <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 md:p-12">
            <div className="flex items-center justify-between mb-10 border-b border-gray-100 pb-6">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                <div className="w-2 h-8 bg-amber-400 rounded-full"></div>
                Phản hồi khách hàng
              </h2>
              <div className="text-right">
                <p className="text-4xl font-black text-gray-900 mb-0">{cake.averageRating.toFixed(1)}</p>
                <Rate disabled allowHalf value={cake.averageRating} className="text-amber-400 text-sm" />
              </div>
            </div>
            
            {isLoadingReviews ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : reviewsData?.items && reviewsData.items.length > 0 ? (
              <>
                <List
                  itemLayout="horizontal"
                  dataSource={reviewsData.items}
                  renderItem={(review: any) => (
                    <List.Item className="border-b border-gray-50 last:border-none py-8 group">
                      <List.Item.Meta
                        avatar={
                          <div className="relative">
                            <Avatar 
                              size={64} 
                              icon={<UserOutlined />} 
                              className="border-2 border-indigo-50 shadow-sm"
                              src={review.user.avatar_url ? (review.user.avatar_url.startsWith('http') ? review.user.avatar_url : `${API_DOMAIN}${review.user.avatar_url}`) : undefined}
                            />
                            <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white shadow-sm"></div>
                          </div>
                        }
                        title={
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <span className="font-black text-gray-800 text-[16px]">{review.user.full_name || "Khách hàng thân thiết"}</span>
                            <div className="flex items-center gap-2">
                              <Rate disabled value={review.rating} className="text-[10px]" />
                            </div>
                            <span className="text-gray-400 text-xs font-medium sm:ml-auto">
                              {new Date(review.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </span>
                          </div>
                        }
                        description={
                          <div className="mt-4 text-gray-600 text-[16px] leading-relaxed bg-gray-50/50 p-4 rounded-2xl border border-gray-50 group-hover:bg-white group-hover:shadow-md transition-all duration-300">
                            {review.comment || "Khách hàng không để lại bình luận."}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
                {reviewsData.total > reviewsData.limit && (
                  <div className="mt-12 flex justify-center">
                    <Pagination 
                      current={page} 
                      total={reviewsData.total} 
                      pageSize={reviewsData.limit} 
                      onChange={setPage} 
                      showSizeChanger={false}
                      className="custom-pagination"
                    />
                  </div>
                )}
              </>
            ) : (
              <Empty description={<span className="text-gray-400 font-medium">Chưa có đánh giá nào. Hãy là người đầu tiên!</span>} className="py-20" />
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-indigo-900 rounded-[32px] p-8 text-white shadow-2xl shadow-indigo-200/50 sticky top-8">
            <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
               Cam kết chất lượng
            </h3>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">🍰</div>
                <div>
                   <h5 className="font-bold mb-1">Nguyên liệu cao cấp</h5>
                   <p className="text-indigo-200 text-sm leading-relaxed">Sử dụng bột matcha Uji, socola Bỉ và phô mai Mascarpone nhập khẩu.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">🚚</div>
                <div>
                   <h5 className="font-bold mb-1">Giao hàng hỏa tốc</h5>
                   <p className="text-indigo-200 text-sm leading-relaxed">Đảm bảo bánh tươi ngon, không bị dập nát khi đến tay khách hàng.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">✨</div>
                <div>
                   <h5 className="font-bold mb-1">Thiết kế tinh tế</h5>
                   <p className="text-indigo-200 text-sm leading-relaxed">Mỗi chiếc bánh là một tác phẩm nghệ thuật dành riêng cho bạn.</p>
                </div>
              </div>
            </div>
            
            <Divider className="border-white/10 my-8" />
            
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
               <p className="text-xs font-black uppercase tracking-widest text-indigo-300 mb-2">Hỗ trợ 24/7</p>
               <p className="text-xl font-black mb-0">1900 888 999</p>
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        .variant-selector .ant-radio-button-wrapper {
          border-radius: 12px !important;
          background: #f8fafc;
        }
        .variant-selector .ant-radio-button-wrapper:not(:first-child)::before {
          display: none;
        }
        .custom-pagination .ant-pagination-item {
          border-radius: 8px;
          border: none;
          font-weight: bold;
          background: #f8fafc;
        }
        .custom-pagination .ant-pagination-item-active {
          background: #4f46e5;
        }
        .custom-pagination .ant-pagination-item-active a {
          color: white !important;
        }
      `}</style>
    </div>
  );
};
