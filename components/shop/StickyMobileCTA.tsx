"use client";

import { useShop, Product } from "@/context/ShopContext";
import { useTranslations, useLocale } from "next-intl";
import { ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";

interface StickyMobileCTAProps {
    product: Product;
    onBuyNow: () => void;
}

export default function StickyMobileCTA({ product, onBuyNow }: StickyMobileCTAProps) {
    const { settings } = useShop();
    const t = useTranslations('Product');
    const tCommon = useTranslations('Common');
    const locale = useLocale();
    const [isVisible, setIsVisible] = useState(false);

    // Show after scrolling past the main CTA or just always show after some scroll
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (!isVisible) return null;

    let displayTitle = "Product";
    if (product?.title) {
        if (typeof product.title === 'object' && product.title !== null) {
            displayTitle = (product.title as any)[locale] || (product.title as any)['ar'] || (product.title as any)['en'] || (product.title as any)['fr'] || "Product";
        } else {
            displayTitle = String(product.title);
        }
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:hidden animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center gap-3">
                {/* Thumb */}
                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                    <Image
                        src={product.image || "/placeholder.png"}
                        alt={displayTitle}
                        fill
                        className="object-cover"
                    />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{displayTitle}</h3>
                    <p className="text-emerald-600 font-extrabold text-sm leading-tight">
                        {product.price} {tCommon('currency')}
                    </p>
                </div>

                {/* Button */}
                <button
                    onClick={onBuyNow}
                    className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-gray-200 active:scale-95 transition whitespace-nowrap"
                >
                    {t('buy_now')}
                </button>
            </div>
        </div>
    );
}
