import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import { ShopProvider } from "@/context/ShopContext";
import { Toaster } from "sonner";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  title: "Next Shop | Premium E-commerce",
  description: "The best place to shop online in Morocco. High quality, fast delivery.",
  openGraph: {
    title: "Next Shop | Premium E-commerce",
    description: "The best place to shop online in Morocco.",
    images: [
      {
        url: "https://placehold.co/1200x630/10b981/ffffff?text=Next+Shop",
        width: 1200,
        height: 630,
        alt: "Next Shop Preview",
      },
    ],
  },
};

import StoreLayout from "@/components/StoreLayout";
import Analytics from "@/components/Analytics";
import WhatsAppButton from "@/components/WhatsAppButton";
import StoreSuspended from "@/components/StoreSuspended";
import StoreProtectedWrapper from "@/components/StoreProtectedWrapper";

import ScrollToTop from "@/components/ScrollToTop";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${tajawal.className} bg-white text-gray-900 antialiased`}>
        <ShopProvider>
          <StoreProtectedWrapper>
            <Analytics />
            <StoreLayout>
              {children}
            </StoreLayout>
            <WhatsAppButton />
            <ScrollToTop />
          </StoreProtectedWrapper>
          <Toaster position="top-center" richColors />
        </ShopProvider>
      </body>
    </html>
  );
}
