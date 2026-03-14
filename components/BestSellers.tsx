"use client";
import React, { useRef } from 'react';
import Link from 'next/link';
import { MoveRight, MoveLeft } from 'lucide-react';
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
        <div className="flex justify-center mt-12">
          <Link
            href={`/${locale}/collections/all`}
            className="group inline-flex items-center gap-3 px-10 py-3 rounded-none border border-gray-900 text-gray-900 font-light tracking-widest text-sm uppercase hover:bg-gray-800 hover:text-white transition-all duration-500 hover:shadow-lg hover:shadow-gray-100 hover:-translate-y-0.5 active:scale-95"
          >
            <span>{locale === 'ar' ? 'رؤية المزيد' : 'View More'}</span>
            {isRTL
              ? <MoveLeft className="w-4 h-4 stroke-[1.25] transition-transform duration-500 group-hover:-translate-x-1" />
              : <MoveRight className="w-4 h-4 stroke-[1.25] transition-transform duration-500 group-hover:translate-x-1" />}
          </Link>
        </div>
      </div>
    </section>
  );
}
