"use client";

import { useShop, Product } from "@/context/ShopContext";
import { useState, useEffect } from "react";
import Image from "next/image";
import ProductModal from "@/components/shop/ProductModal";
import CheckoutModal from "@/components/shop/CheckoutModal";
import ProductSkeleton from "@/components/ProductSkeleton";
import ProductCard from "@/components/shop/ProductCard";
import CategoryRail from "@/components/shop/CategoryRail";
import { ArrowLeft } from "lucide-react";

export default function Storefront() {
  const { products, filteredProducts, settings } = useShop();
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Simulate loading
  useEffect(() => {
    if (products.length > 0 || settings.storeName) {
      setLoading(false);
    } else {
      const timer = setTimeout(() => setLoading(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [products, settings]);

  const handleProductClick = (p: Product) => {
    setSelectedProduct(p);
    setIsProductModalOpen(true);
  };

  // Filter Products: Combined Search (from context) + Category
  const displayProducts = selectedCategory === "All"
    ? filteredProducts
    : filteredProducts.filter(p => p.category === selectedCategory);

  return (
    <div className="w-full font-tajawal pb-20">

      {/* HERO SECTION (Classic & Clean) */}
      <div className="mt-24 max-w-5xl mx-auto px-4 w-full animate-in slide-in-from-top-4 duration-700">
        <div className={`h-48 md:h-60 w-full rounded-3xl overflow-hidden shadow-lg shadow-emerald-900/10 flex relative ${settings.heroImage ? '' : 'bg-gradient-to-r from-emerald-800 to-emerald-600'}`}>

          {/* Custom Image Mode */}
          {settings.heroImage ? (
            <img src={settings.heroImage} className="w-full h-full object-cover" alt="Hero" />
          ) : (
            <>
              {/* Default Gradient Mode */}
              <div className="w-full md:w-2/3 p-8 md:p-10 flex flex-col justify-center z-10">
                <span className="text-emerald-200 font-bold mb-2 tracking-wide text-xs md:text-sm uppercase">100% Quality Guarantee</span>
                <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                  أفضل المنتجات <br /> بأفضل الأسعار
                </h2>
                <button
                  onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-yellow-400 text-yellow-900 w-fit px-6 py-3 rounded-full font-black text-sm shadow-lg hover:bg-yellow-300 hover:scale-105 transition flex items-center gap-2"
                >
                  تصفح الآن <ArrowLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Right Illustration */}
              <div className="hidden md:block w-1/3 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-emerald-500 rounded-full opacity-20 blur-3xl"></div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* CATEGORY RAIL */}
      <div className="max-w-5xl mx-auto mt-6">
        <CategoryRail selectedCategory={selectedCategory} onSelect={setSelectedCategory} />
      </div>

      {/* SEARCH & PRODUCTS GRID */}
      <main id="products" className="max-w-6xl mx-auto px-4 flex-1 w-full mt-8">

        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg md:text-2xl font-black text-gray-800 flex items-center gap-2">
            {selectedCategory === "All" ? "✨ وصل حديثاً" : `📂 ${selectedCategory}`}
          </h3>
          <span
            onClick={() => setSelectedCategory("All")}
            className="text-xs md:text-sm font-bold text-emerald-600 cursor-pointer hover:underline bg-emerald-50 px-3 py-1 rounded-full"
          >
            عرض الكل
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <ProductSkeleton key={i} />)}
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-20 animate-in zoom-in duration-500">
            <div className="text-6xl mb-4 grayscale opacity-50">🔍</div>
            <h3 className="text-xl font-bold text-gray-400">لا توجد نتائج</h3>
            <p className="text-gray-400 text-sm">جرب البحث بكلمة أخرى</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 pb-10">
            {displayProducts.map((p, idx) => (
              <div key={p.id} className="animate-in fade-in fill-mode-backwards" style={{ animationDelay: `${idx * 50}ms` }}>
                <ProductCard product={p} onClick={handleProductClick} />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={selectedProduct}
      />

      <CheckoutModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

    </div>
  );
}
