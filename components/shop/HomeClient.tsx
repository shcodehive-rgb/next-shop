"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { useShop, Product, Category, SiteSettings } from "@/context/ShopContext";
import HeroBanner from "@/components/HeroBanner";
import FeaturesBar from "@/components/FeaturesBar";
import HomepageReviews from "@/components/HomepageReviews";
import StoreReviews from "@/components/StoreReviews";
import ProductCard from "@/components/shop/ProductCard";
import CategoryShowcase from "./CategoryShowcase";
import CategoryGrid from "@/components/CategoryGrid";

interface HomeClientProps {
    initialProducts?: Product[];
    initialCategories?: Category[];
    initialSettings?: SiteSettings;
}

export default function HomeClient({ initialProducts, initialCategories, initialSettings }: HomeClientProps) {
    // 🔥 HYBRID APPROACH: Use Props for Instant Load, fallback to Context for Real-time
    const { settings: contextSettings, products: contextProducts, categories: contextCategories, addToCart } = useShop();
    const locale = useLocale();
    const isRTL = locale === "ar";

    // 🛡️ SECURITY: Disable Right-Click & Inspect
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => e.preventDefault();
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.key === "F12" ||
                (e.ctrlKey && e.shiftKey && e.key === "I") ||
                (e.ctrlKey && e.key === "u")
            ) {
                e.preventDefault();
            }
        };

        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const products = (contextProducts.length > 0 ? contextProducts : initialProducts) || [];
    const categories = (contextCategories.length > 0 ? contextCategories : initialCategories) || [];
    const settings = (Object.keys(contextSettings).length > 1 ? contextSettings : initialSettings) || {} as SiteSettings;

    // ✨ DYNAMIC SECTIONS - Sort by createdAt desc
    const latestArrivals = [...products]
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 10);

    const bestSellers = products.filter(p => p.isBestSeller).slice(0, 12);
    const featured = products.filter(p => p.isFeatured).slice(0, 12);

    return (
        <div className="min-h-screen bg-white font-tajawal">

            {/* ===== 1. HERO BANNER ===== */}
            <HeroBanner image={settings.heroImage || ''} />

            {/* ===== 2. LATEST ARRIVALS SECTION (SLIDER) ===== */}
            {latestArrivals.length > 0 && (
                <section className="py-16 md:py-24 overflow-hidden">
                    <div className="container mx-auto px-4 md:px-8">
                        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                            <div className={isRTL ? 'text-right' : 'text-left'}>
                                <h2 className="text-3xl md:text-5xl font-light tracking-[0.2em] uppercase mb-4 text-gray-900">
                                    {isRTL ? "أحدث المنتجات" : "Latest Arrivals"}
                                </h2>
                                <p className="text-gray-500 text-sm uppercase tracking-widest font-medium">
                                    {isRTL ? "جديد هذا الأسبوع" : "New This Week"}
                                </p>
                            </div>

                            {/* Desktop scroll hints */}
                            <div className="hidden md:flex gap-2">
                                <div className="w-12 h-[1px] bg-gray-200 mt-4 opacity-0 md:opacity-100" />
                            </div>
                        </div>

                        {/* Horizontal Slider Layout */}
                        <div className="flex overflow-x-auto snap-x snap-mandatory gap-5 md:gap-8 scrollbar-hide pb-8 -mx-4 px-4 md:-mx-8 md:px-8">
                            {latestArrivals.map((product) => (
                                <div key={product.id} className="min-w-[260px] md:min-w-[320px] snap-start transition-opacity duration-300 flex flex-col">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                            {/* Empty space for better scrolling end */}
                            <div className="min-w-[10px] h-full" />
                        </div>

                        {/* Shop All Button - Premium Square Look */}
                        <div className="mt-16 text-center">
                            <Link
                                href={`/${locale}/collections/all`}
                                className="inline-flex items-center justify-center px-12 py-5 bg-black border border-black text-white font-light tracking-[0.3em] uppercase rounded-none hover:bg-white hover:text-black transition-all duration-500 group shadow-2xl active:scale-95 translate-y-0 hover:-translate-y-1"
                            >
                                {isRTL ? "عرض جميع المنتجات" : "Shop All Products"}
                                <span className={`${isRTL ? 'mr-3' : 'ml-3'} group-hover:${isRTL ? '-translate-x-2' : 'translate-x-2'} transition-transform duration-300`}>
                                    {isRTL ? '←' : '→'}
                                </span>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* ===== 3. CATEGORY SHOWCASE ===== */}
            <CategoryShowcase products={products} categories={categories} />

            {/* ===== 3.5. 3-COLUMN CATEGORY GRID ===== */}
            <CategoryGrid />

            {/* ===== 4. BEST SELLERS SECTION (Consistent Grid) ===== */}
            {bestSellers.length > 0 && (
                <section className="py-16 md:py-24 bg-gray-50/30">
                    <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                        <div className="mb-16 text-center">
                            <h2 className="text-3xl md:text-5xl font-light tracking-[0.2em] uppercase mb-4 text-gray-900">
                                {isRTL ? "الأكثر مبيعاً" : "Best Sellers"}
                            </h2>
                            <div className="w-24 h-[1px] bg-emerald-600 mx-auto" />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                            {bestSellers.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ===== 5. HOMEPAGE REVIEWS (Social Proof) ===== */}
            <HomepageReviews />

            {/* ===== 6. STORE REVIEWS (Text & Ratings) ===== */}
            <StoreReviews />

            {/* ===== 7. FEATURES BAR (Trust Signals) ===== */}
            {settings.showFeatures !== false && <FeaturesBar />}

        </div>
    );
}

