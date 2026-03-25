"use client";

import { useCakeQuery } from "../hooks";
import { AddToCartBtn } from "../../cart/components/AddToCartBtn";
import { Skeleton, Breadcrumb } from "antd";
import Link from "next/link";
import { ArrowLeftOutlined } from "@ant-design/icons";

export const CakeDetail = ({ id }: { id: string }) => {
  const { data: cake, isLoading, isError } = useCakeQuery(id);

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
    <div className="max-w-6xl mx-auto px-4 py-8">
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
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{cake.name}</h1>
          <div className="text-4xl font-black text-indigo-600 mb-6 drop-shadow-sm">
            {cake.formattedPrice}
          </div>
          
          <div className="prose text-gray-600 mb-8 whitespace-pre-wrap flex-growtext-lg min-h-[150px]">
            {cake.description || "Chưa có mô tả cho sản phẩm này."}
          </div>
          
          <div className="mt-auto pt-6 border-t border-gray-100 flex gap-4 items-center">
            <AddToCartBtn cakeId={cake.id} />
          </div>
        </div>
      </div>
    </div>
  );
};
