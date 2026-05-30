import Footer from "@/components/footer/Footer";
import Navbar from "@/components/navbar/Navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full flex flex-col">
      <Navbar />

      {/* offset navbar */}
      <div className="mt-[62px] sm:mt-[74px] md:mt-[114px] flex-1">
        {children}
      </div>

      <Footer />
    </div>
  );
}