"use client";
import React, { useRef } from 'react';
import ProductCard from './shop/ProductCard';

export default function BestSellers({ products }: { products: any[] }) {
  if (!products || products.length === 0) return null;

  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-16 bg-gradient-to-b from-orange-50 to-white overflow-hidden" dir="rtl">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
          🔥 الأكثر طلباً
        </h2>

        {/* Carousel Container */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="overflow-hidden"
          >
            <div className="flex gap-6 animate-scroll-rtl">
              {/* First set */}
              {products.map((product, index) => (
                <div 
                  key={`product-${product.id}-${index}`} 
                  className="flex-shrink-0 w-[300px]"
                >
                  <ProductCard product={product} />
                </div>
              ))}
              {/* Second set (duplicate for infinite loop) */}
              {products.map((product, index) => (
                <div 
                  key={`product-dup-${product.id}-${index}`} 
                  className="flex-shrink-0 w-[300px]"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animation - RTL (Right to Left) */}
      <style jsx>{`
        @keyframes scroll-rtl {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(50%);
          }
        }
        
        .animate-scroll-rtl {
          animation: scroll-rtl 40s linear infinite;
          display: flex;
          width: max-content;
        }
        
        .animate-scroll-rtl:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}

