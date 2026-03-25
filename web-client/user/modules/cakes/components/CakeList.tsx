"use client";

import { useState, useEffect } from "react";
import { Input, Skeleton, Empty } from "antd";
import { useCakesQuery } from "../hooks";
import { CakeCard } from "./CakeCard";

export const CakeList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, isError } = useCakesQuery(debouncedSearch);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-extrabold text-gray-800">Danh Mục Bánh</h1>
        <Input.Search
          placeholder="Tìm kiếm bánh..."
          allowClear
          enterButton="Tìm Kiếm"
          size="large"
          className="max-w-md"
          onChange={(e) => setSearchTerm(e.target.value)}
          onSearch={(val) => setSearchTerm(val)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton.Node active key={i} style={{ width: "100%", height: 300 }} />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center text-red-500 py-10 text-lg">
          Đã xảy ra lỗi khi tải danh sách sản phẩm.
        </div>
      ) : data?.items.length === 0 ? (
        <Empty description="Không tìm thấy sản phẩm nào" className="py-20" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data?.items.map((cake) => (
            <CakeCard key={cake.id} cake={cake} />
          ))}
        </div>
      )}
    </div>
  );
};
