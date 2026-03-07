"use client";
import React from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from "next-intl";
import { useShop } from "@/context/ShopContext";
import { Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import Image from 'next/image';

// ── Business Rules ────────────────────────────────────────────────────────────
const ADDON_THRESHOLD = 99;   // Products < 99 DH → show "منتج إضافي" badge

interface ProductCardProps {
  product: any;
  onClick?: (p: any) => void;
  priority?: boolean;
  /** Kept for backward compatibility with CartDrawer upsell strip */
  forceShow?: boolean;
}

export default function ProductCard({ product, onClick, priority = false, forceShow = false }: ProductCardProps) {
  const { addToCart, openCart } = useShop();
  const price = Number(product.price);
  const original = product.originalPrice ? Number(product.originalPrice) : 0;
  const hasDiscount = original > price;
  const t = useTranslations('Common');
  const locale = useLocale();

  // All visible products are shown in the catalog (no price-based hiding)

  // Badges
  const showDiscountBadge = product.discountLabel && product.discountLabel.trim() !== "";
  // ── Rule 3: "منتج إضافي" badge for ALL products < 99 DH ─────────────────────
  const showAddonBadge = price < ADDON_THRESHOLD;

  // Title
  let displayTitle = "Product";
  if (product?.title) {
    displayTitle = typeof product.title === 'object'
      ? product.title[locale] || product.title['ar'] || product.title['en'] || product.title['fr'] || "Product"
      : String(product.title);
  }

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) { e.preventDefault(); onClick(product); }
  };

  const imageSrc = product.images?.length > 0 ? product.images[0] : product.image;
  const isRemote = imageSrc?.startsWith('http') && !imageSrc?.startsWith('data:');

  return (
    <Link
      href={`/${locale}/product/${product.id}`}
      onClick={handleClick}
      className="group block relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 w-full overflow-hidden"
    >
      {/* IMAGE */}
      <div className="relative aspect-square w-full bg-white overflow-hidden rounded-t-xl border-b border-gray-50 select-none">
        <Image
          src={imageSrc || '/placeholder.svg'}
          alt={displayTitle}
          fill
          className="object-contain transition-transform duration-500 group-hover:scale-110 select-none"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          unoptimized={!isRemote}
          onContextMenu={(e) => e.preventDefault()}
          draggable={false}
        />

        {/* Subtle Watermark */}
        <div className="absolute bottom-2 right-2 text-white opacity-30 pointer-events-none select-none font-bold text-[10px]">
          Luxe Store
        </div>

        {/* Discount Badge (manual label) */}
        {showDiscountBadge && (
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-red-600 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-md shadow-sm animate-pulse">
              {product.discountLabel}
            </span>
          </div>
        )}

        {/* ── Add-on Badge (auto, price < 99 DH) ─────────────────────────────── */}
        {showAddonBadge && !showDiscountBadge && (
          <div className="absolute top-2 right-2 z-10">
            <span className="bg-amber-500 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-md shadow-sm">
              منتج إضافي
            </span>
          </div>
        )}

        {/* Quick Add To Cart */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCart(product);
            openCart();
            toast.success(`${displayTitle} added to cart!`);
            // Deduplication ID — ties browser pixel + CAPI together
            const addToCartEventId = (crypto.randomUUID ? crypto.randomUUID() : `atc_${Date.now()}`);
            // @ts-ignore
            if (window.fbq) window.fbq('track', 'AddToCart', { content_name: displayTitle, content_ids: [product.id], content_type: 'product', value: price, currency: 'MAD' }, { eventID: addToCartEventId });
            // @ts-ignore
            if (window.ttq) window.ttq.track('AddToCart', { content_id: product.id, content_type: 'product', content_name: displayTitle, value: price, currency: 'MAD' });
            // Server-side CAPI (deduplication via matching eventID)
            fetch('/api/meta-events', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                event_name: 'AddToCart',
                event_id: addToCartEventId,
                event_source_url: window.location.href,
                custom_data: { value: price, currency: 'MAD', content_ids: [product.id], content_type: 'product', content_name: displayTitle }
              })
            }).catch(() => { });
          }}
          className="absolute bottom-3 right-3 z-20 bg-white text-emerald-600 p-2.5 rounded-full shadow-lg hover:bg-emerald-600 hover:text-white hover:scale-110 active:scale-95 transition-all duration-300"
          aria-label="Add to cart"
        >
          <ShoppingBag className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>

      {/* DETAILS */}
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-gray-800 font-bold text-sm leading-tight mb-2 text-right line-clamp-2">
          {displayTitle}
        </h3>
        <div className="mt-auto flex flex-col items-end">
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">{original} {t('currency')}</span>
          )}
          <span className="text-green-600 font-extrabold text-lg">
            {price} <span className="text-xs font-normal text-gray-500">{t('currency')}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
