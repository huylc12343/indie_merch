import type { Metadata } from "next";
import { Inter, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "In-đỉ In-đi | Indie Music Fest | 9+ Nghệ sĩ/Band Indie Hà Nội | 20.06.2026",
  description: "In-đỉ In-đi | Indie Music Fest | 9+ Nghệ sĩ/Band Indie Hà Nội | 20.06.2026",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    type: "website",
    title: "In-đỉ In-đi | Indie Music Fest | 9+ Nghệ sĩ/Band Indie Hà Nội | 20.06.2026",
    description: "In-đỉ In-đi | Indie Music Fest | 9+ Nghệ sĩ/Band Indie Hà Nội | 20.06.2026",
    images: ["/img/website-thumb_1200x630.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "In-đỉ In-đi | Indie Music Fest | 9+ Nghệ sĩ/Band Indie Hà Nội | 20.06.2026",
    description: "In-đỉ In-đi | Indie Music Fest | 9+ Nghệ sĩ/Band Indie Hà Nội | 20.06.2026",
    images: ["/img/website-thumb_1200x630.jpg"],
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        {children}

        {/* global toast vẫn giữ ở đây */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              border: "2px solid #f3f3f3",
              padding: "16px 20px",
              fontSize: "18px",
              fontWeight: "600",
              background: "#fff",
              color: "#171717",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            },
          }}
        />
      </body>
    </html>
  );
}