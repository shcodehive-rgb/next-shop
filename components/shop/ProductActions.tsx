"use client";

import { useShop } from "@/context/ShopContext";
import { useTranslations, useLocale } from "next-intl";
import { useState, useCallback } from "react";
import { ShieldCheck, Truck } from "lucide-react";
import CheckoutForm from "@/components/shop/CheckoutForm";

interface ProductActionsProps {
    product: any;
    onAddToCart: () => void;
}

export default function ProductActions({ product, onAddToCart }: ProductActionsProps) {
    const { addToCart } = useShop();
    const t = useTranslations('Product');
    const tCommon = useTranslations('Common');
    const locale = useLocale();
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    const handleCheckout = useCallback(() => {
        setIsCheckoutOpen(true);
    }, []);

    const handleCloseCheckout = useCallback(() => {
        setIsCheckoutOpen(false);
    }, []);

    const handleAddToCartClick = useCallback(() => {
        addToCart(product);
        onAddToCart?.();
    }, [product, addToCart, onAddToCart]);

    return (
        <div className="space-y-4">
            {/* Add to Cart Button */}
            <button
                onClick={handleAddToCartClick}
                className="w-full bg-black text-white font-light tracking-wider text-sm uppercase py-4 px-6 rounded-lg hover:bg-gray-800 transition-colors"
            >
                {locale === 'ar' ? 'أضف للسلة' : 'Add to Cart'}
            </button>

            {/* Buy Now Button */}
            <button
                onClick={handleCheckout}
                className="w-full bg-emerald-600 text-white font-light tracking-wider text-sm uppercase py-4 px-6 rounded-lg hover:bg-emerald-700 transition-colors"
            >
                {locale === 'ar' ? 'اطلب الآن' : 'Buy Now'}
            </button>

            {/* Checkout Form */}
            {isCheckoutOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                {locale === 'ar' ? 'إتمام الطلب' : 'Complete Your Order'}
                            </h3>
                            <button
                                onClick={handleCloseCheckout}
                                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Checkout Form Content */}
                        <CheckoutForm
                            product={product}
                            className="bg-emerald-50/50 border-emerald-100 shadow-sm"
                            onAddToCart={() => {
                                setIsCheckoutOpen(false);
                                addToCart(product);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
