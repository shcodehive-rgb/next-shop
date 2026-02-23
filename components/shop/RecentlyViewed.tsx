"use client";

import { useShop } from "@/context/ShopContext";
import { useTranslations, useLocale } from "next-intl";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface RecentlyViewedProduct {
    id: string;
    title: string | { [key: string]: string };
    price: string;
    image: string;
    viewedAt: number;
}

export default function RecentlyViewed({ currentProductId }: { currentProductId: string }) {
    const { products } = useShop();
    const locale = useLocale();
    const t = useTranslations('Common');
    
    const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedProduct[]>([]);

    // Load recently viewed products from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('recentlyViewed');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setRecentlyViewed(parsed);
            } catch (error) {
                console.error('Error parsing recently viewed products:', error);
            }
        }
    }, []);

    // Filter out current product and get full product details
    const filteredProducts = recentlyViewed
        .filter(item => item.id !== currentProductId)
        .slice(0, 5) // Show max 5 products
        .map(viewedItem => {
            const product = products.find(p => p.id === viewedItem.id);
            if (product) {
                return {
                    ...product,
                    viewedAt: viewedItem.viewedAt
                };
            }
            return null;
        })
        .filter(Boolean) // Remove null entries
        .sort((a, b) => (b?.viewedAt || 0) - (a?.viewedAt || 0)); // Sort by most recent

    if (filteredProducts.length === 0) {
        return null; // Don't show section if no recently viewed products
    }

    return (
        <section className="mt-16 pt-10 border-t border-gray-100">
            <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900 font-tajawal">
                    {locale === 'ar' ? 'المنتجات التي شاهدتها مؤخراً' : 'Recently Viewed Products'}
                </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredProducts.map((product) => {
                    if (!product) return null;
                    
                    // Handle localized title
                    let displayTitle = "Product";
                    if (product?.title) {
                        displayTitle = typeof product.title === 'object'
                            ? (product.title as any)[locale] || (product.title as any)['ar'] || (product.title as any)['en'] || (product.title as any)['fr'] || "Product"
                            : String(product.title);
                    }

                    const isRemote = (src: string) => src?.startsWith('http') && !src?.startsWith('data:');
                    const img = product.images?.[0] || product.image || "/placeholder.svg";

                    return (
                        <Link
                            key={product.id}
                            href={`/${locale}/product/${product.id}`}
                            className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
                        >
                            <div className="relative aspect-square bg-gray-50 overflow-hidden">
                                <Image
                                    src={img}
                                    alt={displayTitle}
                                    fill
                                    className="object-contain group-hover:scale-105 transition-transform duration-500 select-none"
                                    unoptimized={!isRemote(img)}
                                    onContextMenu={(e) => e.preventDefault()}
                                    draggable={false}
                                />
                                {/* Subtle Watermark */}
                                <div className="absolute bottom-2 right-2 text-white opacity-30 pointer-events-none select-none font-bold text-[10px]">
                                    Luxe Store
                                </div>
                                {product.discountLabel && (
                                    <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                        {product.discountLabel}
                                    </span>
                                )}
                            </div>
                            <div className="p-3">
                                <p className="font-bold text-gray-800 text-sm line-clamp-2 mb-1 font-tajawal">{displayTitle}</p>
                                <span className="text-emerald-600 font-black text-base">{product.price} <span className="text-xs font-bold text-gray-400">DH</span></span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
