"use client";
import React from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from "next-intl";

import { useShop } from "@/context/ShopContext";
import { Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import Image from 'next/image';

interface ProductCardProps {
  product: any;
  onClick?: (p: any) => void;
  priority?: boolean;
}

export default function ProductCard({ product, onClick, priority = false }: ProductCardProps) {
  const { addToCart, openCart } = useShop();
  // Logic to calculate discount
  const price = Number(product.price);
  const original = product.originalPrice ? Number(product.originalPrice) : 0;
  const hasDiscount = original > price;
  const t = useTranslations('Common');
  // Add locale hook
  const locale = useLocale();

  // 🛑 CHANGED: Only show badge if user manually entered discountLabel in Admin
  // Do NOT auto-calculate percentages
  const showBadge = product.discountLabel && product.discountLabel.trim() !== "";

  // Dynamic Title Translation Logic with Robust Fallback
  let displayTitle = "Product";
  if (product && product.title) {
    if (typeof product.title === 'object' && product.title !== null) {
      // Try current locale first, then fallback to ar, en, fr, or any available
      displayTitle = product.title[locale] || product.title['ar'] || product.title['en'] || product.title['fr'] || "Product";
    } else {
      displayTitle = String(product.title);
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick(product);
    }
  };

  // Helper to determine if image is remote or local/base64
  // If base64 or external without configured domain, we might fallback to img or use unoptimized
  const imageSrc = product.images && product.images.length > 0 ? product.images[0] : product.image;
  const isRemote = imageSrc?.startsWith('http') && !imageSrc?.startsWith('data:');

  return (
    <Link
      href={`/${locale}/product/${product.id}`}
      onClick={handleClick}
      className="group block relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 w-full overflow-hidden"
    >
      {/* 1. IMAGE CONTAINER (SQUARE & WHITE) */}
      <div className="relative aspect-square w-full bg-white overflow-hidden rounded-t-xl border-b border-gray-50">
        <Image
          src={imageSrc || '/placeholder.png'} // Fallback
          alt={displayTitle}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          unoptimized={!isRemote} // Use unoptimized for Base64 (legacy images) to avoid next/image config errors
        />

        {/* Discount Badge - Only if manually set */}
        {showBadge && (
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-red-600 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-md shadow-sm animate-pulse">
              {product.discountLabel}
            </span>
          </div>
        )}

        {/* Quick Add To Cart Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCart(product);
            openCart(); // Open drawer immediately
            toast.success(`${displayTitle} added to cart!`);

            // 📊 PIXEL TRACKING: AddToCart
            // Facebook
            // @ts-ignore
            if (window.fbq) {
              // @ts-ignore
              window.fbq('track', 'AddToCart', {
                content_name: displayTitle,
                content_ids: [product.id],
                content_type: 'product',
                value: price,
                currency: 'MAD'
              });
            }
            // TikTok
            // @ts-ignore
            if (window.ttq) {
              // @ts-ignore
              window.ttq.track('AddToCart', {
                content_id: product.id,
                content_type: 'product',
                content_name: displayTitle,
                value: price,
                currency: 'MAD'
              });
            }
          }}
          className="absolute bottom-3 right-3 z-20 bg-white text-emerald-600 p-2.5 rounded-full shadow-lg hover:bg-emerald-600 hover:text-white hover:scale-110 active:scale-95 transition-all duration-300 opacity-100 translate-y-0"
          aria-label="Add to cart"
        >
          <ShoppingBag className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>

      {/* 2. DETAILS (Compact) */}
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-gray-800 font-bold text-sm leading-tight mb-2 text-right line-clamp-2">
          {displayTitle}
        </h3>

        <div className="mt-auto flex flex-col items-end">
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              {original} {t('currency')}
            </span>
          )}
          <span className="text-green-600 font-extrabold text-lg">
            {price} <span className="text-xs font-normal text-gray-500">{t('currency')}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
