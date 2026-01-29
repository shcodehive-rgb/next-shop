"use client";

import { useShop, Product } from "@/context/ShopContext";
import ProductGrid from "@/components/ProductGrid";
import { use, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductModal from "@/components/shop/ProductModal";

interface CollectionPageProps {
    params: Promise<{ id: string }>;
}

export default function CollectionPage({ params }: CollectionPageProps) {
    const { id } = use(params);
    const { products, categories } = useShop();

    const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Derive data during render
    const category = categories.find((c) => c.id === id);
    const categoryName = category ? category.name : (categories.length > 0 ? "Category Not Found" : "Loading...");

    // Filter logic
    const categoryProducts = categoryName && categoryName !== "Category Not Found" && categoryName !== "Loading..."
        ? products.filter(p => p.category === categoryName)
        : [];

    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-white pb-20 font-tajawal">
            {/* Header */}
            <div className="bg-white shadow-sm border-b py-6 mb-8">
                <div className="container mx-auto px-4 flex items-center gap-4">
                    <Link href="/" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
                        <ArrowRight className="w-5 h-5 text-gray-600" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">{categoryName}</h1>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4">
                {categoryProducts.length > 0 ? (
                    <ProductGrid products={categoryProducts} onProductClick={handleProductClick} />
                ) : (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">لا توجد منتجات في هذا القسم حالياً.</p>
                        <Link href="/" className="mt-4 inline-block text-emerald-600 font-bold hover:underline">
                            العودة للرئيسية
                        </Link>
                    </div>
                )}
            </div>

            {/* PRODUCT MODAL */}
            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={selectedProduct}
            />
        </div>
    );
}
