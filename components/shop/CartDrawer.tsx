"use client";

import { useShop } from "@/context/ShopContext";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function CartDrawer() {
    const {
        isCartOpen,
        closeCart,
        cart,
        updateCartQty,
        removeFromCart,
        openCheckout
    } = useShop();

    const t = useTranslations('Checkout'); // Reusing checkout translations appropriately
    const tCommon = useTranslations('Common');
    const locale = useLocale();
    const [animateOpen, setAnimateOpen] = useState(false);

    // Animation Effect
    useEffect(() => {
        if (isCartOpen) {
            setAnimateOpen(true);
            document.body.style.overflow = 'hidden'; // Prevent scroll
        } else {
            setAnimateOpen(false);
            document.body.style.overflow = 'unset';
        }
    }, [isCartOpen]);

    if (!isCartOpen) return null;

    const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0);

    const getLocalizedTitle = (title: any) => {
        if (typeof title === 'string') return title;
        if (typeof title === 'object' && title !== null) {
            return title[locale] || title['ar'] || title['en'] || title['fr'] || "Product";
        }
        return "Product";
    };

    const handleCheckout = () => {
        closeCart();
        setTimeout(() => {
            openCheckout();
        }, 150); // Small delay for smooth transition
    };

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${animateOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={closeCart}
            />

            {/* Drawer */}
            <div
                className={`relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-out ${animateOpen ? 'translate-x-0' : 'ltr:translate-x-full rtl:-translate-x-full'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white z-10">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-emerald-600" />
                        {t('title') || "Your Cart"}
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
                            {cart.length}
                        </span>
                    </h2>
                    <button
                        onClick={closeCart}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-gray-500">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                                <ShoppingBag className="w-10 h-10 text-gray-300" />
                            </div>
                            <p className="text-lg font-medium">{t('empty_cart') || "Your cart is empty"}</p>
                            <button
                                onClick={closeCart}
                                className="text-emerald-600 font-bold hover:underline"
                            >
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.id} className="flex gap-4 p-3 bg-white border border-gray-100 rounded-2xl hover:border-emerald-100 transition shadow-sm">
                                {/* Image */}
                                <div className="relative w-20 h-20 shrink-0 bg-gray-50 rounded-xl overflow-hidden">
                                    <Image
                                        src={item.image || '/placeholder.svg'}
                                        alt={getLocalizedTitle(item.title)}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                {/* Details */}
                                <div className="flex-1 flex flex-col justify-between p-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-snug">
                                                {getLocalizedTitle(item.title)}
                                            </h3>
                                            {item.selectedVariant && (
                                                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded mt-1 inline-block">
                                                    {item.selectedVariant}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id, item.selectedVariant)}
                                            className="text-gray-300 hover:text-red-500 transition p-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Price & Qty */}
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="font-bold text-emerald-600">
                                            {Number(item.price)} {tCommon('currency')}
                                        </div>

                                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                                            <button
                                                onClick={() => item.qty > 1 ? updateCartQty(item.id, item.qty - 1, item.selectedVariant) : removeFromCart(item.id, item.selectedVariant)}
                                                className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-emerald-600 active:scale-95 transition"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                                            <button
                                                onClick={() => updateCartQty(item.id, item.qty + 1, item.selectedVariant)}
                                                className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-emerald-600 active:scale-95 transition"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Actions */}
                {cart.length > 0 && (
                    <div className="p-5 bg-gray-50 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-4 text-gray-600 font-medium">
                            <span>{t('total') || "Subtotal"}</span>
                            <span className="text-xl font-black text-gray-900">{subtotal} {tCommon('currency')}</span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 shadow-lg shadow-emerald-200 active:scale-[0.98] transition flex items-center justify-center gap-2"
                        >
                            ملء المعلومات
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-2">
                            <span className="block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Free Delivery • Cash on Delivery
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
