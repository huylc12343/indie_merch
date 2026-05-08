import type { ReactNode } from "react";
import CheckOutNavbar from "@/components/navbar/CheckOutNavbar";
import Footer from "@/components/footer/Footer";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-[#333333]">
      <CheckOutNavbar />
      <div className="mt-[114px]">{children}</div>
      <Footer />
    </div>
  );
}
