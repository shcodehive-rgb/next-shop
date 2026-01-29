"use client";
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

export default function BestSellers({ products }: { products: any[] }) {
  // Hide section if no products - CHECK BEFORE HOOKS
  if (!products || products.length === 0) return null;

  const sliderRef = useRef<HTMLDivElement>(null);

  // AUTO-SCROLL LOGIC (Smooth continuous scrolling)
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const speed = 1; // Pixels per interval
    
    const scrollInterval = setInterval(() => {
      if (slider) {
        slider.scrollLeft += speed;
        // Reset to start if reached end (Infinite loop effect)
        if (slider.scrollLeft >= slider.scrollWidth - slider.clientWidth) {
          slider.scrollLeft = 0;
        }
      }
    }, 20); // Smooth animation interval (20ms = 50fps)

    return () => clearInterval(scrollInterval);
  }, []);

  return (
    <div className="py-8 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 mb-6">
         <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          🔥 الأكثر طلباً
         </h2>
      </div>

      {/* Auto-Scrolling Slider */}
      <div 
        ref={sliderRef}
        className="flex overflow-x-auto pb-8 px-4 gap-4 md:gap-6 no-scrollbar scroll-smooth"
        style={{ scrollBehavior: 'smooth' }}
      >
                {products.map((product) => {
                    // Force convert to numbers to avoid errors
                    const price = Number(product.price);
                    const original = product.originalPrice ? Number(product.originalPrice) : 0;

                    // Calculate discount percentage if original price exists
                    const hasDiscount = original > price;

                    // 🛑 CHANGED: Only show badge if user manually entered discountLabel in Admin
                    // Do NOT auto-calculate percentages
                    const showBadge = product.discountLabel && product.discountLabel.trim() !== "";

                    return (
                        <Link
                            key={product.id}
                            href={`/product/${product.id}`}
                            className="group min-w-[170px] max-w-[170px] md:min-w-[210px] md:max-w-[210px] flex-shrink-0 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300"
                        >
                            {/* Image Container */}
                            <div className="relative h-48 w-full bg-white rounded-t-xl overflow-hidden">
                                <img
                                    src={product.images && product.images.length > 0 ? product.images[0] : product.image}
                                    alt={product.title}
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                />

                                {/* BADGE - Only if manually set */}
                                {showBadge && (
                                    <div className="absolute top-2 left-2 z-10">
                                        <span className="bg-red-600 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-md shadow-sm animate-pulse">
                                            {product.discountLabel}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Info Container */}
                            <div className="p-4">
                                <h3 className="text-sm font-bold text-gray-700 truncate mb-2 text-right">
                                    {product.title}
                                </h3>

                                <div className="flex flex-col items-end gap-0.5">
                                    {/* Old Price (Struck through) */}
                                    {hasDiscount && (
                                        <span className="text-xs text-gray-400 line-through font-medium">
                                            {original} DH
                                        </span>
                                    )}
                                    {/* New Price (Big & Green) */}
                                    <span className="text-green-600 font-extrabold text-lg">
                                        {price} DH
                                    </span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
