"use client";

import { MessageSquarePlus, Plus } from "lucide-react";
import { Product } from "@/context/ShopContext";

interface ProductCardProps {
    product: Product;
    onClick: (p: Product) => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
    // Logic for badges (e.g. if price < some value, or just generic "New")
    const isPromo = false;

    return (
        <div
            onClick={() => onClick(product)}
            className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer border border-transparent hover:border-emerald-100 relative flex flex-col h-full"
        >
            {/* Badge */}
            {isPromo && (
                <div className="absolute top-3 left-3 bg-orange-100 text-orange-600 text-[10px] font-black px-2 py-1 rounded-full z-10">
                    PROMO
                </div>
            )}

            {/* Image Area */}
            <div className="aspect-square relative mb-3 overflow-hidden rounded-xl bg-gray-50">
                <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1">
                {/* Category/Unit (Optional) */}
                <span className="text-xs text-gray-400 font-bold mb-1">{product.category || "General"}</span>

                {/* Title */}
                <h3 className="text-gray-900 font-bold text-sm md:text-base leading-snug line-clamp-2 mb-3 flex-1">
                    {product.title}
                </h3>

                {/* Bottom Row */}
                <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                        <span className="text-emerald-700 font-black text-lg">
                            {product.price} <span className="text-xs font-medium">DH</span>
                        </span>
                        {product.wholesalePrice && (
                            <span className="text-xs text-blue-500 font-bold">
                                Wholesale: {product.wholesalePrice}
                            </span>
                        )}
                    </div>

                    {/* Circular Action Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent card click, just modal? actually card click does same.
                            onClick(product);
                        }}
                        className="w-10 h-10 rounded-full bg-gray-100 text-gray-800 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors shadow-sm group-active:scale-90"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
