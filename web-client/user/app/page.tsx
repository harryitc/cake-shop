import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { BestSellerSection } from "@/components/landing/BestSellerSection";
import { PromotionSection } from "@/components/landing/PromotionSection";
import { StorySection } from "@/components/landing/StorySection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { GallerySection } from "@/components/landing/GallerySection";
import { StoreInfoSection } from "@/components/landing/StoreInfoSection";
import { StickyCTA } from "@/components/landing/StickyCTA";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-white">
        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2. How It Works - Quy trình đặt hàng */}
        <HowItWorksSection />

        {/* 3. Best Seller - Sản phẩm nổi bật */}
        <BestSellerSection />

        {/* 4. Promotion - Khuyến mãi & Countdown */}
        <PromotionSection />

        {/* 5. Story - Câu chuyện thương hiệu */}
        <StorySection />

        {/* 6. Testimonials - Phản hồi khách hàng */}
        <TestimonialsSection />

        {/* 7. Gallery - Thư viện ảnh */}
        <GallerySection />

        {/* 8. Store Info - Thông tin cửa hàng & Map */}
        <StoreInfoSection />
      </main>
      <Footer />

      {/* 9. Sticky CTA Mobile */}
      <StickyCTA />
    </div>
  );
}
