"use client";

import { useState, useEffect } from "react";

import { useShop, Product, Category, SiteSettings } from "@/context/ShopContext";
import HeroBanner from "@/components/HeroBanner";
import CategoryRail from "@/components/CategoryRail";
import BestSellers from "@/components/BestSellers";
import PromoBanner from "@/components/PromoBanner";
import FeaturesBar from "@/components/FeaturesBar";
import HomepageReviews from "@/components/HomepageReviews";
import StoreReviews from "@/components/StoreReviews";
import CategoryProducts from "@/components/shop/CategoryProducts";
import MidPageSlider from "@/components/shop/MidPageSlider";

interface HomeClientProps {
    initialProducts?: Product[];
    initialCategories?: Category[];
    initialSettings?: SiteSettings;
}

export default function HomeClient({ initialProducts, initialCategories, initialSettings }: HomeClientProps) {
    // 🔥 HYBRID APPROACH: Use Props for Instant Load, fallback to Context for Real-time
    const { settings: contextSettings, products: contextProducts, categories: contextCategories } = useShop();

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

    // Prefer Context if loaded (for real-time updates), otherwise use Initial Props (for instant SSR)
    // Actually, Context is empty initially -> causes flicker. 
    // Logic: If Context has data, it means client hydration finished and real-time sync started. 
    // But we want to show PRE-RENDERED data immediately. 

    // Simple Strategy: Use Props if available. `useShop` will update eventually. 
    // Ideally, we sync Props into Context or just use Props for display.
    // For pure display, Props are sufficient.

    const products = (contextProducts.length > 0 ? contextProducts : initialProducts) || [];
    const categories = (contextCategories.length > 0 ? contextCategories : initialCategories) || [];
    const settings = (Object.keys(contextSettings).length > 1 ? contextSettings : initialSettings) || {} as SiteSettings;

    // Filter Best Sellers
    const bestSellers = products.filter(p => p.isBestSeller);

    // Category Filter State
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Filter Logic
    const filteredCategories = selectedCategory === 'all'
        ? categories
        : categories.filter(c => c.id === selectedCategory);

    return (
        <div className="min-h-screen bg-white pb-20 font-tajawal">

            {/* 1. TOP BANNER — always rendered so skeleton shows immediately */}
            <HeroBanner image={settings.heroImage || ''} />

            {/* 2. CIRCULAR CATEGORIES */}
            <div className="container mx-auto px-4 my-6">
                <CategoryRail
                    categories={categories}
                />
            </div>

            {/* 3. BEST SELLERS SLIDER (Only if exists) */}
            <BestSellers products={bestSellers} />

            {/* 4. PRODUCTS BY CATEGORY */}


            {categories.length === 0 ? (
                <div className="text-center py-20 px-4">
                    <div className="bg-emerald-50 rounded-3xl p-8 max-w-2xl mx-auto border border-emerald-100">
                        <h2 className="text-2xl font-black text-emerald-800 mb-2">Welcome to your new store! 🚀</h2>
                        <p className="text-emerald-700 mb-6">You haven't added any categories or products yet.</p>
                        <a href="/admin" className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition">
                            Go to Admin Panel
                        </a>
                    </div>
                </div>
            ) : (
                categories.map(category => (
                    <CategoryProducts
                        key={category.id}
                        categoryId={category.id}
                        // Pass data down to avoid prop-drilling delay
                        products={products}
                        category={category}
                    />
                ))
            )}

            {/* 5. MIDDLE PROMO BANNER */}
            {settings.middleBanner && (
                <PromoBanner
                    image={settings.middleBanner}
                    link={settings.middleBannerLink || "#products"}
                />
            )}

            {/* 6. MID-PAGE NETFLIX SLIDER (products tagged showInMidPageSlider) */}
            <MidPageSlider products={products} />

            {/* 7. HOMEPAGE REVIEWS (Social Proof Screenshots) */}
            <HomepageReviews />

            {/* 7. STORE REVIEWS (Text & Star Ratings) */}
            <StoreReviews />

            {/* 8. FEATURES BAR (Trust Signals) */}
            {settings.showFeatures !== false && <FeaturesBar />}

        </div>
    );
}

