import Link from "next/link";
import { ShopOutlined, FacebookOutlined, InstagramOutlined, TwitterOutlined } from "@ant-design/icons";

export const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto pt-16 pb-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-16 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex flex-col gap-3 group mb-4 w-fit">
              <div className="flex items-center gap-2">
                <div className="bg-[#533afd] text-white p-2 rounded-xl shadow-sm shadow-[#533afd]/20">
                  <ShopOutlined className="text-[20px]" />
                </div>
                <span className="text-[22px] font-black text-gray-900 tracking-tight ml-1">CakeShop</span>
              </div>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">
              Hương vị tuyệt hảo từ nguyên liệu tươi ngon nhất, tạo nên những chiếc bánh đậm đà đầy tình yêu.
            </p>
            <div className="flex gap-4">
              <span className="h-10 w-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-[#533afd] hover:border-[#533afd] hover:shadow-md hover:shadow-[#533afd]/10 transition-all cursor-pointer"><FacebookOutlined className="text-[17px]" /></span>
              <span className="h-10 w-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-[#533afd] hover:border-[#533afd] hover:shadow-md hover:shadow-[#533afd]/10 transition-all cursor-pointer"><InstagramOutlined className="text-[17px]" /></span>
              <span className="h-10 w-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-[#533afd] hover:border-[#533afd] hover:shadow-md hover:shadow-[#533afd]/10 transition-all cursor-pointer"><TwitterOutlined className="text-[17px]" /></span>
            </div>
          </div>
          
          <div>
            <h4 className="font-extrabold text-gray-900 mb-6 text-lg tracking-tight">Khám Phá</h4>
            <ul className="space-y-4 font-medium">
              <li><Link href="/cakes" className="text-gray-500 hover:text-[#533afd] transition-colors">Tất Cả Sản Phẩm</Link></li>
              <li><Link href="/" className="text-gray-500 hover:text-[#533afd] transition-colors">Bánh Sinh Nhật</Link></li>
              <li><Link href="/" className="text-gray-500 hover:text-[#533afd] transition-colors">Bánh Kem Tươi</Link></li>
              <li><Link href="/" className="text-gray-500 hover:text-[#533afd] transition-colors">Bánh Ăn Kiêng</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-gray-900 mb-6 text-lg tracking-tight">Hỗ Trợ</h4>
            <ul className="space-y-4 font-medium">
              <li><Link href="/" className="text-gray-500 hover:text-[#533afd] transition-colors">Theo Dõi Đơn Hàng</Link></li>
              <li><Link href="/" className="text-gray-500 hover:text-[#533afd] transition-colors">Chính Sách Giao Hàng</Link></li>
              <li><Link href="/" className="text-gray-500 hover:text-[#533afd] transition-colors">Chính Sách Đổi Trả</Link></li>
              <li><Link href="/" className="text-gray-500 hover:text-[#533afd] transition-colors">Câu Hỏi Thường Gặp</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-extrabold text-gray-900 mb-6 text-lg tracking-tight">Liên Hệ</h4>
            <ul className="space-y-4 font-medium text-gray-500">
              <li className="flex items-start gap-3">
                <span className="font-bold text-gray-700 w-[60px]">Địa chỉ:</span>
                <span className="leading-relaxed">123 Đường Bánh Ngọt, P.1, Quận 3, TP.HCM</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-gray-700 w-[60px]">Phone:</span>
                <span>0123 456 789</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-gray-700 w-[60px]">Email:</span>
                <span className="text-[#533afd] hover:underline cursor-pointer">hello@cakeshop.dev</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-200 text-center flex flex-col items-center">
          <p className="text-gray-400 text-[13px] font-medium tracking-wide">
            © {new Date().getFullYear()} Cake Shop. Developed with Love & Next.js.
          </p>
        </div>
      </div>
    </footer>
  );
};
