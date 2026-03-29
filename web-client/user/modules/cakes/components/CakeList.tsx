"use client";

import { useState } from "react";
import { Input, Skeleton, Empty, Select, Checkbox, Slider, Divider, Button } from "antd";
import { useCakesQuery, useCategoriesQuery } from "../hooks";
import { CakeCard } from "./CakeCard";
import { FilterOutlined, CloseOutlined, SearchOutlined, RocketOutlined } from "@ant-design/icons";
import { useDebounce } from "../../../hooks/use-debounce";

interface Category {
  _id: string;
  name: string;
  type: 'OCCASION' | 'FLAVOR' | 'DIET' | 'OTHER';
}

export const CakeList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);
  const [selectedSort, setSelectedSort] = useState("newest");
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const { data: categoriesData } = useCategoriesQuery();
  const categories: Category[] = categoriesData || [];

  const { data, isLoading, isError } = useCakesQuery({
    search: debouncedSearch,
    categories: selectedCategories,
    min_price: priceRange[0],
    max_price: priceRange[1],
    sort: selectedSort,
  });

  const occasionCats = categories.filter(c => c.type === 'OCCASION');
  const flavorCats = categories.filter(c => c.type === 'FLAVOR');
  const dietCats = categories.filter(c => c.type === 'DIET');

  const renderFilterSidebar = () => (
    <div className="flex flex-col gap-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-24">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
          <FilterOutlined className="text-indigo-600" /> Bộ lọc
        </h3>
        <Button 
          type="text" 
          onClick={() => { 
            setSelectedCategories([]); 
            setPriceRange([0, 2000000]); 
            setSearchTerm("");
          }} 
          className="text-xs font-bold text-indigo-500 hover:text-indigo-700"
        >
          Xóa tất cả
        </Button>
      </div>

      <div className="space-y-6">
        {/* Occasions */}
        <div>
          <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Theo Dịp Lễ</h4>
          <div className="flex flex-col gap-2.5">
            {occasionCats.map(cat => (
              <Checkbox 
                key={cat.id} 
                checked={selectedCategories.includes(cat.id)}
                onChange={(e) => {
                  if (e.target.checked) setSelectedCategories([...selectedCategories, cat.id]);
                  else setSelectedCategories(selectedCategories.filter(id => id !== cat.id));
                }}
                className="font-bold text-gray-600 hover:text-indigo-600 transition-colors"
              >
                {cat.name}
              </Checkbox>
            ))}
          </div>
        </div>

        <Divider className="my-0 border-gray-50" />

        {/* Flavors */}
        <div>
          <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Hương Vị Yêu Thích</h4>
          <div className="flex flex-wrap gap-2">
            {flavorCats.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  if (selectedCategories.includes(cat.id)) setSelectedCategories(selectedCategories.filter(id => id !== cat.id));
                  else setSelectedCategories([...selectedCategories, cat.id]);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${
                  selectedCategories.includes(cat.id) 
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                  : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200 hover:text-gray-600'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <Divider className="my-0 border-gray-50" />

        {/* Price Range */}
        <div>
          <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Khoảng Giá</h4>
          <Slider
            range
            min={0}
            max={2000000}
            step={50000}
            value={priceRange}
            onChange={(val) => setPriceRange(val as [number, number])}
            className="mx-2"
          />
          <div className="flex justify-between mt-4">
            <div className="bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 min-w-[80px]">
              <span className="text-[10px] text-gray-400 block font-bold leading-none mb-1">Từ</span>
              <span className="text-xs font-black text-gray-800">{priceRange[0] >= 1000000 ? (priceRange[0]/1000000).toFixed(1) + 'tr' : (priceRange[0]/1000).toLocaleString() + 'k'}</span>
            </div>
            <div className="bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 min-w-[80px] text-right">
              <span className="text-[10px] text-gray-400 block font-bold leading-none mb-1">Đến</span>
              <span className="text-xs font-black text-gray-800">{priceRange[1] >= 1000000 ? (priceRange[1]/1000000).toFixed(1) + 'tr' : (priceRange[1]/1000).toLocaleString() + 'k'}</span>
            </div>
          </div>
        </div>

        <Divider className="my-0 border-gray-50" />

        {/* Diet */}
        <div>
          <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Chế độ ăn</h4>
          <div className="flex flex-col gap-2.5">
            {dietCats.map(cat => (
              <Checkbox 
                key={cat.id} 
                checked={selectedCategories.includes(cat.id)}
                onChange={(e) => {
                  if (e.target.checked) setSelectedCategories([...selectedCategories, cat.id]);
                  else setSelectedCategories(selectedCategories.filter(id => id !== cat.id));
                }}
                className="font-bold text-gray-600"
              >
                {cat.name}
              </Checkbox>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 bg-indigo-900 rounded-2xl p-5 text-white relative overflow-hidden group">
         <div className="relative z-10">
            <RocketOutlined className="text-3xl mb-3 text-indigo-300 group-hover:rotate-12 transition-transform" />
            <h5 className="font-black text-sm mb-1">Sự kiện Sắp Tới?</h5>
            <p className="text-[11px] text-indigo-200 leading-relaxed mb-3">Đừng quên chúng tôi nhận đặt bánh theo yêu cầu riêng biệt!</p>
            <Button size="small" className="bg-white text-indigo-900 border-none font-bold rounded-lg text-[10px]">Liên hệ ngay</Button>
         </div>
         <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-indigo-800 rounded-full blur-2xl opacity-50 group-hover:scale-125 transition-transform duration-700"></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <aside className="hidden lg:block lg:col-span-1">
          {renderFilterSidebar()}
        </aside>

        <main className="lg:col-span-3">
          <div className="mb-10 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="w-full sm:w-auto">
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-1">Danh Mục Bánh</h1>
              <p className="text-gray-400 font-medium">Tìm thấy <span className="text-indigo-600 font-bold">{data?.total || 0}</span> chiếc bánh tuyệt vời dành cho bạn.</p>
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto">
               <div className="flex-grow sm:w-64">
                  <Input 
                    placeholder="Tìm theo tên bánh..." 
                    prefix={<SearchOutlined className="text-gray-300" />}
                    size="large"
                    className="rounded-2xl border-gray-100 shadow-sm h-12"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               <Select
                 defaultValue="newest"
                 size="large"
                 className="w-40 sort-select h-12"
                 onChange={setSelectedSort}
                 options={[
                   { value: 'newest', label: <span className="font-bold text-gray-700">Mới nhất</span> },
                   { value: 'price_asc', label: <span className="font-bold text-gray-700">Giá tăng dần</span> },
                   { value: 'price_desc', label: <span className="font-bold text-gray-700">Giá giảm dần</span> },
                   { value: 'rating', label: <span className="font-bold text-gray-700">Đánh giá cao</span> },
                 ]}
               />
               <div className="lg:hidden flex items-center">
                 <Button 
                  icon={<FilterOutlined />} 
                  className="h-12 w-12 rounded-2xl font-bold flex items-center justify-center border-gray-100 shadow-sm text-gray-600"
                  onClick={() => setShowMobileFilter(true)}
                 />
               </div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white p-4 rounded-3xl border border-gray-50 shadow-sm">
                   <Skeleton active avatar={{ shape: 'square', size: 200 }} paragraph={{ rows: 3 }} />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center text-red-500 py-20 font-black bg-red-50 rounded-3xl border border-red-100">
              Đã xảy ra lỗi khi kết nối máy chủ!
            </div>
          ) : data?.items.length === 0 ? (
            <Empty description={<span className="text-gray-400 font-bold">Không tìm thấy chiếc bánh nào phù hợp với yêu cầu của bạn.</span>} className="py-20" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {data?.items.map((cake) => (
                <CakeCard key={cake.id} cake={cake} />
              ))}
            </div>
          )}
        </main>
      </div>

      {showMobileFilter && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-white">
          <div className="p-4 flex justify-between items-center border-b">
             <h3 className="text-lg font-black">Bộ lọc sản phẩm</h3>
             <Button type="text" icon={<CloseOutlined />} onClick={() => setShowMobileFilter(false)} />
          </div>
          <div className="flex-grow overflow-y-auto">
             {renderFilterSidebar()}
          </div>
          <div className="p-4 border-t bg-gray-50">
             <Button type="primary" block className="h-12 rounded-xl bg-indigo-600 font-bold" onClick={() => setShowMobileFilter(false)}>Áp dụng</Button>
          </div>
        </div>
      )}

      <style jsx global>{`
        .sort-select .ant-select-selector {
          border-radius: 16px !important;
          border-color: #f1f5f9 !important;
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05) !important;
        }
      `}</style>
    </div>
  );
};
