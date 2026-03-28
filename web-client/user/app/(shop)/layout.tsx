import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      <Header />
      <main className="flex-grow flex flex-col w-full overflow-x-hidden pt-20 pb-20">
        {children}
      </main>
      <Footer />
    </div>
  );
}
