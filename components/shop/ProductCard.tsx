"use client";
import React from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from "next-intl";
import { useShop } from "@/context/ShopContext";
import { toast } from "sonner";
import Image from 'next/image';

interface ProductCardProps {
  product: any;
  onClick?: (p: any) => void;
  priority?: boolean;
}

export default function ProductCard({ product, onClick, priority = false }: ProductCardProps) {
  const { addToCart, openCart } = useShop();
  const price = Number(product.price);
  const locale = useLocale();
  const t = useTranslations('Common');

  // Title Logic
  let displayTitle = "Product";
  if (product?.title) {
    if (typeof product.title === 'string') {
      displayTitle = product.title;
    } else if (typeof product.title === 'object') {
      const titleObj = product.title as any;
      displayTitle = titleObj[locale] || titleObj['ar'] || titleObj['en'] || titleObj['fr'] || "Product";
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick(product);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart(product);
    openCart();
    toast.success(`${displayTitle} added to cart!`);

    const addToCartEventId = (crypto.randomUUID ? crypto.randomUUID() : `atc_${Date.now()}`);
    // @ts-ignore
    if (window.fbq) window.fbq('track', 'AddToCart', { content_name: displayTitle, content_ids: [product.id], content_type: 'product', value: price, currency: 'MAD' }, { eventID: addToCartEventId });
    // @ts-ignore
    if (window.ttq) window.ttq.track('AddToCart', { content_id: product.id, content_type: 'product', content_name: displayTitle, value: price, currency: 'MAD' });

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
  };

  const imageSrc = product.images?.length > 0 ? product.images[0] : product.image;
  const isRemote = imageSrc?.startsWith('http') && !imageSrc?.startsWith('data:');

  return (
    <Link
      href={`/${locale}/product/${product.id}`}
      onClick={handleClick}
      className="group flex flex-col cursor-pointer w-full"
    >
      {/* 1. TALL PORTRAIT IMAGE WITH OVERLAY BUTTON */}
      <div className="relative w-full aspect-[4/5] bg-[#f4f4f4] overflow-hidden group">
        <Image
          src={imageSrc || '/placeholder.svg'}
          alt={displayTitle}
          fill
          className="object-cover object-center absolute inset-0 w-full h-full hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          unoptimized={!isRemote}
          draggable={false}
        />

        {/* Diagonal Watermark Overlay */}
        <div className="absolute inset-0 flex items-center justify-center text-white/20 text-2xl font-black uppercase tracking-[0.2em] pointer-events-none transform -rotate-45 select-none z-10">
          Luxe Store
        </div>

        {/* ACHAT RAPIDE - HOVER OVERLAY */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-0 left-0 w-full bg-black/90 text-white text-xs font-bold py-4 uppercase text-center transition-all duration-300 transform translate-y-full group-hover:translate-y-0 z-20 md:translate-y-full md:group-hover:translate-y-0 translate-y-0"
        >
          ACHAT RAPIDE
        </button>
      </div>

      {/* 2. CLEAN TEXT SECTION (LEFT ALIGNED) */}
      <div className="mt-3 flex flex-col gap-0.5 text-left">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
          {displayTitle}
        </h3>
        <p className="text-sm font-bold text-black mt-0.5">
          {price} <span className="text-[10px] font-bold text-gray-400">MAD</span>
        </p>
      </div>
    </Link>
  );
}
