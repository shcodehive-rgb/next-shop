"use client";

import { useShop } from "@/context/ShopContext";
import ProductCard from "@/components/shop/ProductCard";
import ShopSidebar from "@/components/shop/ShopSidebar";
import Link from "next/link";
import { useLocale } from "next-intl";
import { ArrowLeft, Package } from "lucide-react";

interface Props {
    initialProducts: any[];
    categoryName: string;
}

export default function CollectionClient({ initialProducts, categoryName }: Props) {
    const { priceFilter } = useShop();
    const locale = useLocale();

    // Apply price filter from context to server-fetched products
    const products = initialProducts.filter((p) => {
        const price = Number(p.price);
        const min = priceFilter?.min ?? 0;
        const max = priceFilter?.max ?? 3000;
        return price >= min && price <= max;
    });

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
                    <h1 className="text-xl font-black text-gray-900">{categoryName}</h1>
                    <span className="text-sm text-gray-400">
                        {products.length} {locale === "ar" ? "منتج" : "products"}
                    </span>
                </div>
            </div>

            {/* Mobile filter button row */}
            <div className="lg:hidden container mx-auto px-4 pt-4">
                <ShopSidebar />
            </div>

            {/* Layout: Sidebar + Grid */}
            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar — desktop only */}
                    <div className="hidden lg:block lg:col-span-1">
                        <ShopSidebar />
                    </div>

                    {/* Products */}
                    <div className="lg:col-span-3">
                        {products.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <Package className="w-16 h-16 text-gray-200 mb-4" />
                                <p className="text-gray-400 text-lg font-medium">
                                    {locale === "ar"
                                        ? "لا توجد منتجات في هذه الفئة"
                                        : "No products in this category"}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {products.map((product, index) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        priority={index < 8}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
