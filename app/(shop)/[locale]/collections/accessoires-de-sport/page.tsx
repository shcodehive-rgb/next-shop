"use client";

import { useShop } from "@/context/ShopContext";
import ProductGrid from "@/components/ProductGrid";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ShopSidebar from "@/components/shop/ShopSidebar";

export default function AccessoiresDeSportPage() {
  const { filteredProducts, searchQuery, categories } = useShop();
  const locale = useLocale();
  const searchParams = useSearchParams();

  // Filter for "accessoires de sport" category
  const sportProducts = filteredProducts.filter(p =>
    p.category === "accessoires-de-sport" ||
    (typeof p.category === "string" && p.category.toLowerCase().includes("accessoires")) ||
    (typeof p.category === "object" && (
      (p.category as any)?.[locale]?.toLowerCase().includes("accessoires") ||
      (p.category as any)?.en?.toLowerCase().includes("accessoires") ||
      (p.category as any)?.ar?.toLowerCase().includes("accessoires")
    ))
  );

  const pageTitle = locale === "ar" ? "إكسسوارات الرياضية" : "Accessoires de Sport";

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-tajawal">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-5 flex items-center justify-between">
          <Link
            href={`/${locale}/collections`}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            {locale === "ar" ? "العودة للمجموعات" : "Back to Collections"}
          </Link>
          <h1 className="text-xl font-black text-gray-900">
            {pageTitle}
          </h1>
          <span className="text-sm text-gray-400">
            {sportProducts.length} {locale === "ar" ? "منتج" : "products"}
          </span>
        </div>
      </div>

      <div className="w-full px-2 md:px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-8 w-full">
          {/* Sidebar — desktop only */}
          <aside className="!hidden lg:!block w-full lg:w-1/4 shrink-0">
            <ShopSidebar />
          </aside>

          {/* Products Grid */}
          <div className="w-full lg:w-3/4 flex-1">
            <ProductGrid products={sportProducts} searchQuery={searchQuery} />
          </div>
        </div>
      </div>
    </div>
  );
}
