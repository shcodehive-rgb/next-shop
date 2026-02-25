"use client";

import { useShop } from "@/context/ShopContext";
import ProductCard from "@/components/shop/ProductCard";
import Link from "next/link";
import { useLocale } from "next-intl";
import { ArrowLeft, Star } from "lucide-react";

export default function BestSellersPage() {
    const { products } = useShop();
    const locale = useLocale();

    const bestSellers = products.filter(
        (p) => p.isBestSeller && p.visible !== false
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-tajawal">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 shadow-sm">
                <div className="container mx-auto px-4 py-5 flex items-center justify-between">
                    <Link
                        href={`/${locale}`}
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition font-medium text-sm"
                    >
                        <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                        {locale === "ar" ? "العودة للمتجر" : "Back to Shop"}
                    </Link>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                        {locale === "ar" ? "الأكثر طلباً" : "Best Sellers"}
                    </h1>
                    <span className="text-sm text-gray-400 font-medium">
                        {bestSellers.length} {locale === "ar" ? "منتج" : "products"}
                    </span>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {bestSellers.length === 0 ? (
                    <div className="text-center py-24">
                        <Star className="w-16 h-16 mx-auto text-gray-200 mb-4 fill-gray-200" />
                        <p className="text-gray-400 text-lg font-medium">
                            {locale === "ar"
                                ? "لا توجد منتجات مميزة حالياً"
                                : "No best sellers yet"}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {bestSellers.map((product, index) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                priority={index < 6}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
