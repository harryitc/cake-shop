import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-white">
        {/* Lớp Landing Hero Section Tuyệt Đẹp */}
        <section className="relative overflow-hidden w-full min-h-[650px] md:h-[800px] flex items-center justify-center bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/60">
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#533afd] rounded-full mix-blend-multiply filter blur-[150px] opacity-[0.15] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-pink-500 rounded-full mix-blend-multiply filter blur-[150px] opacity-[0.1] animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>
          
          <div className="relative z-10 container mx-auto px-6 text-center max-w-4xl py-20">
            <div className="inline-block mb-6 px-5 py-2 rounded-full bg-white/80 border border-gray-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] backdrop-blur-md text-sm font-extrabold text-[#533afd] uppercase tracking-[0.2em]">
              Bộ Sưu Tập Mới Nhất 2026
            </div>
            <h1 className="text-5xl md:text-[80px] font-black text-gray-900 mb-8 leading-[1.1] tracking-tight drop-shadow-sm">
              Lưu Giữ Khoảnh Khắc <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#533afd] to-pink-500 inline-block mt-2">Ngọt Ngào Nhất</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 mb-12 max-w-2xl mx-auto leading-[1.6] font-medium">
              Khám phá bộ sưu tập bánh kem hương vị thủ công thượng hạng, thay bạn gửi trao thông điệp yêu thương đến những người quan trọng.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <Link href="/cakes" className="w-full sm:w-auto px-10 py-[22px] bg-[#533afd] hover:bg-[#341ac9] text-white rounded-2xl font-bold text-[17px] shadow-[0_8px_20px_-6px_rgba(83,58,253,0.5)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_24px_-6px_rgba(83,58,253,0.6)] text-center">
                Khám Phá Thực Đơn
              </Link>
              <Link href="/register" className="w-full sm:w-auto px-10 py-[22px] bg-white text-gray-700 border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 rounded-2xl font-bold text-[17px] shadow-sm transition-all text-center">
                Tạo Tài Khoản
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Highlights Section */}
        <section className="py-24 bg-white relative z-20 border-t border-gray-100/50">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-5 tracking-tight">Vì sao chọn CakeShop?</h2>
              <div className="w-16 h-1.5 bg-[#533afd] mx-auto rounded-full opacity-80"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 pl-2 pr-2">
              <div className="p-10 rounded-3xl bg-gray-50/50 border border-gray-100/80 hover:bg-white hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-all duration-300 group">
                <div className="w-16 h-16 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.04)] rounded-2xl flex items-center justify-center mb-8 text-3xl group-hover:-translate-y-2 transition-transform duration-300">🍰</div>
                <h3 className="text-[22px] font-extrabold text-gray-900 mb-4 tracking-tight group-hover:text-[#533afd] transition-colors">Tươi Mới Mỗi Ngày</h3>
                <p className="text-gray-500 leading-relaxed font-medium text-[15px]">Mỗi chiếc bánh đều được chế biến trong ngày để đảm bảo độ tươi và hương vị nguyên bản tuyệt vời.</p>
              </div>
              <div className="p-10 rounded-3xl bg-gray-50/50 border border-gray-100/80 hover:bg-white hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-all duration-300 group">
                <div className="w-16 h-16 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.04)] rounded-2xl flex items-center justify-center mb-8 text-3xl group-hover:-translate-y-2 transition-transform duration-300">✨</div>
                <h3 className="text-[22px] font-extrabold text-gray-900 mb-4 tracking-tight group-hover:text-[#533afd] transition-colors">Chất Lượng Cao Cấp</h3>
                <p className="text-gray-500 leading-relaxed font-medium text-[15px]">Chúng tôi chỉ sử dụng các nguyên liệu tinh chọn, nhập khẩu chất lượng nhất từ Bỉ, Pháp và Nhật Bản.</p>
              </div>
              <div className="p-10 rounded-3xl bg-gray-50/50 border border-gray-100/80 hover:bg-white hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-all duration-300 group">
                <div className="w-16 h-16 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.04)] rounded-2xl flex items-center justify-center mb-8 text-3xl group-hover:-translate-y-2 transition-transform duration-300">🚀</div>
                <h3 className="text-[22px] font-extrabold text-gray-900 mb-4 tracking-tight group-hover:text-[#533afd] transition-colors">Giao Hàng Thần Tốc</h3>
                <p className="text-gray-500 leading-relaxed font-medium text-[15px]">Đội ngũ vận chuyển chuyên nghiệp bảo quản bánh lạnh, giao liền tay an toàn nguyên vẹn 100%.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
