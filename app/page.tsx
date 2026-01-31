"use client";

import { useShop, Product } from "@/context/ShopContext";
import HeroBanner from "@/components/HeroBanner";
import CategoryRail from "@/components/CategoryRail";
import BestSellers from "@/components/BestSellers";
import PromoBanner from "@/components/PromoBanner";
import FeaturesBar from "@/components/FeaturesBar";
import { ShopProvider } from "@/context/ShopContext";

export default function HomePage() {
  const { settings, products, categories } = useShop();

  // Filter Best Sellers
  const bestSellers = products.filter(p => p.isBestSeller);

  return (
    <div className="min-h-screen bg-white pb-20 font-tajawal">

      {/* 1. TOP BANNER */}
      {settings.heroImage && <HeroBanner image={settings.heroImage} />}

      {/* 2. CIRCULAR CATEGORIES */}
      <div className="container mx-auto px-4 my-6">
        <CategoryRail
          categories={categories}
        />
      </div>

      {/* 3. BEST SELLERS SLIDER (Only if exists) */}
      <BestSellers products={bestSellers} />

      {/* 4. MIDDLE PROMO BANNER */}
      {settings.middleBanner && (
        <PromoBanner
          image={settings.middleBanner}
          link={settings.middleBannerLink || "#products"}
        />
      )}

      {/* 5. FEATURES BAR (Trust Signals) */}
      {settings.showFeatures !== false && <FeaturesBar />}

    </div>
  );
}
