"use client";

import { useCakeQuery, useCakeReviewsQuery } from "../hooks";
import { AddToCartBtn } from "../../cart/components/AddToCartBtn";
import { Skeleton, Breadcrumb, Rate, Avatar, List, Empty, Pagination } from "antd";
import Link from "next/link";
import { ArrowLeftOutlined, UserOutlined } from "@ant-design/icons";
import { useState } from "react";

const API_DOMAIN = process.env.NEXT_PUBLIC_API_DOMAIN || "http://localhost:5000";

export const CakeDetail = ({ id }: { id: string }) => {
  const [page, setPage] = useState(1);
  const { data: cake, isLoading, isError } = useCakeQuery(id);
  const { data: reviewsData, isLoading: isLoadingReviews } = useCakeReviewsQuery(id, page);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Skeleton active avatar={{ shape: 'square', size: 400 }} paragraph={{ rows: 6 }} />
      </div>
    );
  }

  if (isError || !cake) {
    return <div className="p-8 text-center text-xl text-red-500 font-medium">Sản phẩm không tồn tại!</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8">
      <div>
        <div className="mb-6">
          <Breadcrumb items={[
            { title: <Link href="/cakes" className="text-indigo-600 hover:text-indigo-800 font-medium"><ArrowLeftOutlined /> Quay lại danh mục</Link> },
            { title: <span className="text-gray-500">{cake.name}</span> }
          ]} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10 flex flex-col md:flex-row gap-10">
          <div className="w-full md:w-1/2">
            <img
              src={cake.imageUrl}
              alt={cake.name}
              className="w-full aspect-[4/3] rounded-xl object-cover shadow-md"
            />
          </div>

          <div className="w-full md:w-1/2 flex flex-col">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-4xl font-extrabold text-gray-900">{cake.name}</h1>
              {cake.stock === 0 && (
                <span className="bg-red-100 text-red-600 font-bold px-3 py-1 rounded-full text-sm whitespace-nowrap">
                  Hết hàng
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 mb-2">
              <Rate disabled allowHalf value={cake.averageRating} className="text-xl" />
              <span className="text-gray-500 font-medium">({cake.reviewCount} đánh giá)</span>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="text-4xl font-black text-indigo-600 drop-shadow-sm">
                {cake.formattedPrice}
              </div>
              {cake.stock > 0 && (
                <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                  Còn {cake.stock} sản phẩm
                </span>
              )}
            </div>

            <div className="prose text-gray-600 mb-8 whitespace-pre-wrap flex-growtext-lg min-h-[150px]">
              {cake.description || "Chưa có mô tả cho sản phẩm này."}
            </div>

            <div className="mt-auto pt-6 border-t border-gray-100 flex gap-4 items-center">
              {cake.stock > 0 ? (
                <AddToCartBtn cakeId={cake.id} />
              ) : (
                <div className="w-full py-4 text-center bg-gray-100 text-gray-500 font-bold rounded-xl cursor-not-allowed">
                  Sản phẩm tạm thời hết hàng
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section Đánh giá */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4">Khách hàng nói gì về {cake.name}</h2>
        
        {isLoadingReviews ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : reviewsData?.items && reviewsData.items.length > 0 ? (
          <>
            <List
              itemLayout="horizontal"
              dataSource={reviewsData.items}
              renderItem={(review: any) => (
                <List.Item className="border-b border-gray-50 last:border-none py-6">
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        size={48} 
                        icon={<UserOutlined />} 
                        src={review.user.avatar_url ? (review.user.avatar_url.startsWith('http') ? review.user.avatar_url : `${API_DOMAIN}${review.user.avatar_url}`) : undefined}
                      />
                    }
                    title={
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="font-bold text-gray-800">{review.user.full_name || review.user.name || "Khách hàng"}</span>
                        <Rate disabled value={review.rating} className="text-xs" />
                        <span className="text-gray-400 text-xs font-normal ml-auto">
                          {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    }
                    description={
                      <div className="mt-2 text-gray-600 text-[15px] leading-relaxed italic">
                        "{review.comment || "Khách hàng không để lại bình luận."}"
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
            {reviewsData.total > reviewsData.limit && (
              <div className="mt-8 flex justify-center">
                <Pagination 
                  current={page} 
                  total={reviewsData.total} 
                  pageSize={reviewsData.limit} 
                  onChange={setPage} 
                  showSizeChanger={false}
                />
              </div>
            )}
          </>
        ) : (
          <Empty description="Chưa có đánh giá nào cho sản phẩm này." className="py-10" />
        )}
      </div>
    </div>
  );
};
