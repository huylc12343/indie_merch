import type { ReactNode } from "react";
import CheckOutNavbar from "@/components/navbar/CheckOutNavbar";
import Footer from "@/components/footer/Footer";

export default function Layout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div>
      <CheckOutNavbar />
      {children}
      <Footer />
    </div>
  );
}