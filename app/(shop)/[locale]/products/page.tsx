"use client";

import { useShop } from "@/context/ShopContext";
import ProductGrid from "@/components/ProductGrid";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ShopSidebar from "@/components/shop/ShopSidebar";

export default function ProductsPage() {
  const { filteredProducts } = useShop();
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-tajawal">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-5 flex items-center justify-between">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            {locale === "ar" ? "العودة للمتجر" : "Back to Shop"}
          </Link>
          <h1 className="text-xl font-black text-gray-900">
            {locale === "ar" ? "جميع المنتجات" : "All Products"}
          </h1>
          <span className="text-sm text-gray-400">
            {filteredProducts.length} {locale === "ar" ? "منتج" : "products"}
          </span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Mobile filter button row — ShopSidebar renders this via lg:hidden */}
        <div className="lg:hidden mb-4">
          <ShopSidebar />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar — desktop only */}
          <div className="hidden lg:block lg:col-span-1">
            <ShopSidebar />
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <ProductGrid products={filteredProducts} />
          </div>
        </div>
      </div>

    </div>
  );
}
