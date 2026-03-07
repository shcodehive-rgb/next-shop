"use client";
import React, { useState, useEffect } from 'react';
import ProductCard from "./shop/ProductCard";
import { useTranslations, useLocale } from "next-intl";

interface ProductGridProps {
  products: any[];
  searchQuery?: string; // optional: passed from parent to reset pagination
}

export default function ProductGrid({ products, searchQuery = "" }: ProductGridProps) {
  const [visibleCount, setVisibleCount] = useState(12);
  const t = useTranslations('ProductGrid');
  const locale = useLocale();

  // Reset pagination whenever the query or product list changes
  useEffect(() => {
    setVisibleCount(12);
  }, [searchQuery, products.length]);

  // Empty state — shown when search/filter returns no results
  if (!products || products.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center px-4">
        <div className="text-5xl mb-4">🔍</div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">
          {locale === "ar" ? "لا توجد منتجات مطابقة" : "No products found"}
        </h3>
        <p className="text-gray-400 text-sm">
          {locale === "ar"
            ? "حاول البحث بكلمة مختلفة أو تصفح الفئات"
            : "Try a different search term or browse our categories"}
        </p>
      </div>
    );
  }

  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  return (
    <div id="all-products" className="py-12 bg-white">
      <div className="container mx-auto px-4">

        {/* Section Title */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-800">{t('title')}</h2>
          <div className="w-12 h-1 bg-gray-200 mx-auto mt-2 rounded-full"></div>
        </div>

        {/* The Grid: 2 cols mobile, 3 cols tablet, 4 cols desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-12 text-center">
            <button
              onClick={() => setVisibleCount(prev => prev + 12)}
              className="px-8 py-3 bg-white border-2 border-emerald-600 text-emerald-600 font-bold rounded-full hover:bg-emerald-600 hover:text-white transition-all duration-300 shadow-sm"
            >
              {t('load_more')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
