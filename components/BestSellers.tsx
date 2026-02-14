"use client";
import React, { useRef } from 'react';
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
      </div>


    </section>
  );
}
