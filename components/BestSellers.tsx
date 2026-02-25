"use client";
import React, { useRef } from 'react';
import Link from 'next/link';
import ProductCard from './shop/ProductCard';
import { useTranslations, useLocale } from "next-intl";

export default function BestSellers({ products }: { products: any[] }) {
  if (!products || products.length === 0) return null;

  const scrollRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('BestSellers');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <section className="py-16 bg-gradient-to-b from-orange-50 to-white overflow-hidden" key={locale}>
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
          {t('title')}
        </h2>

        {/* Carousel Container */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="overflow-hidden"
          >
            <div className={isRTL ? "flex gap-6 animate-scroll-rtl" : "flex gap-6 animate-scroll-ltr"}>
              {/* First set */}
              {products.map((product, index) => (
                <div
                  key={`product-${product.id}-${index}`}
                  className="flex-shrink-0 w-[300px]"
                >
                  <ProductCard product={product} priority={index < 4} />
                </div>
              ))}
              {/* Second set (duplicate for infinite loop) */}
              {products.map((product, index) => (
                <div
                  key={`product-dup-${product.id}-${index}`}
                  className="flex-shrink-0 w-[300px]"
                >
                  <ProductCard product={product} priority={false} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* View More Button */}
        <div className="flex justify-center mt-10">
          <Link
            href={`/${locale}/products`}
            className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-emerald-600 text-emerald-700 font-bold text-base hover:bg-emerald-600 hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-emerald-200 hover:-translate-y-0.5 active:scale-95"
          >
            <span>{locale === 'ar' ? 'رؤية المزيد' : 'View More'}</span>
            <span className="transform transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
