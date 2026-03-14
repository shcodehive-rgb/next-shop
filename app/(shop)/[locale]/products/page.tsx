"use client";

import { useShop } from "@/context/ShopContext";
import ProductGrid from "@/components/ProductGrid";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ShopSidebar from "@/components/shop/ShopSidebar";
import { useEffect } from "react";

export default function ProductsPage() {
  const { filteredProducts, searchQuery, setSelectedCategory, categories } = useShop();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  // Auto-select category from URL parameter
  useEffect(() => {
    if (categoryParam) {
      // Find the category by ID or name
      const foundCategory = categories.find(
        (cat) =>
          cat.id === categoryParam ||
          (typeof cat.name === "string" && cat.name.toLowerCase() === categoryParam.toLowerCase()) ||
          (typeof cat.name === "object" &&
            (cat.name?.[locale]?.toLowerCase() === categoryParam.toLowerCase() ||
              cat.name?.en?.toLowerCase() === categoryParam.toLowerCase() ||
              cat.name?.ar?.toLowerCase() === categoryParam.toLowerCase()))
      );

      if (foundCategory) {
        setSelectedCategory(foundCategory.id);
      }
    }
  }, [categoryParam, categories, locale, setSelectedCategory]);

  const pageTitle =
    categoryParam && categories.find((c) => c.id === categoryParam)
      ? typeof categories.find((c) => c.id === categoryParam)?.name === "string"
        ? categories.find((c) => c.id === categoryParam)?.name
        : (categories.find((c) => c.id === categoryParam)?.name as any)?.[locale] ||
        (categories.find((c) => c.id === categoryParam)?.name as any)?.en
      : locale === "ar"
        ? "جميع المنتجات"
        : "All Products";

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
            {pageTitle}
          </h1>
          <span className="text-sm text-gray-400">
            {filteredProducts.length} {locale === "ar" ? "منتج" : "products"}
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
            {/* Mobile filter button row — ShopSidebar renders this via lg:hidden */}
            <div className="lg:hidden w-full mb-6">
              <ShopSidebar />
            </div>
            <ProductGrid products={filteredProducts} searchQuery={searchQuery} />
          </div>
        </div>
      </div>

    </div>
  );
}
