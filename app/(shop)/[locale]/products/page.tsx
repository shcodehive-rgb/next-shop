"use client";

import { useShop } from "@/context/ShopContext";
import ProductGrid from "@/components/ProductGrid";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ProductsPage() {
  const { products } = useShop();
  const locale = useLocale();
  const t = useTranslations('Common');

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header with Continue Shopping */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition">
            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
            <span>{locale === 'ar' ? 'العودة للمتجر' : 'Back to Shop'}</span>
          </Link>
          <h1 className="text-2xl font-black text-gray-900">
            {locale === 'ar' ? 'جميع المنتجات' : 'All Products'}
          </h1>
        </div>
      </div>
      
      <ProductGrid products={products} />
    </div>
  );
}
