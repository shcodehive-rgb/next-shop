"use client";

import { useShop } from "@/context/ShopContext";
import { X, Minus, Plus, ShoppingBag, Trash2, AlertTriangle, PackagePlus } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";
import ProductCard from "@/components/shop/ProductCard";

// ── Business Rules ────────────────────────────────────────────────────────────
const MIN_ORDER_VALUE = 149;  // DH — block checkout below this
const UPSELL_THRESHOLD = 20;   // DH — products below this are only shown in cart
const SHIPPING_COST = 0;    // Free shipping globally

export default function CartDrawer() {
    const {
        isCartOpen,
        closeCart,
        cart,
        updateCartQty,
        removeFromCart,
        openCheckout,
        products: allProducts,
    } = useShop();

    const t = useTranslations('Checkout');
    const tCommon = useTranslations('Common');
    const locale = useLocale();
    const [animateOpen, setAnimateOpen] = useState(false);

    useEffect(() => {
        if (isCartOpen) {
            setAnimateOpen(true);
            document.body.style.overflow = 'hidden';
        } else {
            setAnimateOpen(false);
            document.body.style.overflow = 'unset';
        }
    }, [isCartOpen]);

    if (!isCartOpen) return null;

    // ── Totals ────────────────────────────────────────────────────────────────
    const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0);
    const total = subtotal + SHIPPING_COST;

    // ── Rule 2: check MOV ─────────────────────────────────────────────────────
    const meetsMinOrder = subtotal >= MIN_ORDER_VALUE;
    const remaining = MIN_ORDER_VALUE - subtotal;

    // ── Rule 4: upsell products (hidden from catalog, price < 20 DH) ─────────
    // Filter to only those NOT already in cart
    const cartProductIds = new Set(cart.map(i => i.id));
    const upsellProducts = allProducts
        .filter(p => Number(p.price) < UPSELL_THRESHOLD && p.visible !== false && !cartProductIds.has(p.id))
        .slice(0, 6);

    const getLocalizedTitle = (title: any) => {
        if (typeof title === 'string') return title;
        if (typeof title === 'object' && title !== null) {
            return title[locale] || title['ar'] || title['en'] || title['fr'] || "Product";
        }
        return "Product";
    };

    const handleCheckout = () => {
        if (!meetsMinOrder) return; // Guard (button is also disabled)
        closeCart();
        setTimeout(() => openCheckout(), 150);
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
                            <button onClick={closeCart} className="text-emerald-600 font-bold hover:underline">
                                {locale === 'ar' ? 'تابع التسوق' : 'Start Shopping'}
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Cart Items */}
                            {cart.map((item) => (
                                <div key={`${item.id}-${item.selectedVariant}`} className="flex gap-4 p-3 bg-white border border-gray-100 rounded-2xl hover:border-emerald-100 transition shadow-sm">
                                    <div className="relative w-20 h-20 shrink-0 bg-gray-50 rounded-xl overflow-hidden">
                                        <Image
                                            src={item.image || '/placeholder.svg'}
                                            alt={getLocalizedTitle(item.title)}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </div>
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
                            ))}

                            {/* ── Rule 4: Upsell Strip (hidden < 20 DH products) ───────────────────── */}
                            {upsellProducts.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-dashed border-amber-200">
                                    <p className="text-xs font-black text-amber-700 mb-3 flex items-center gap-1.5">
                                        <PackagePlus className="w-4 h-4" />
                                        {locale === 'ar' ? '🛍️ أضف منتجاً إضافياً:' : '🛍️ Add a quick extra:'}
                                    </p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {upsellProducts.map((p) => (
                                            <ProductCard key={p.id} product={p} forceShow priority={false} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer Actions */}
                {cart.length > 0 && (
                    <div className="p-5 bg-gray-50 border-t border-gray-100 space-y-3">

                        {/* Subtotal row */}
                        <div className="flex justify-between items-center text-gray-600 font-medium">
                            <span>{locale === 'ar' ? 'المجموع الجزئي' : 'Subtotal'}</span>
                            <span className="text-xl font-black text-gray-900">{subtotal} {tCommon('currency')}</span>
                        </div>

                        {/* ── Rule 1: Free shipping line ───────────────────────────────────────── */}
                        <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>{locale === 'ar' ? 'الشحن' : 'Shipping'}</span>
                            <span className="text-emerald-600 font-bold">{locale === 'ar' ? 'مجاني 🎁' : 'Free 🎁'}</span>
                        </div>

                        {/* ── Rule 2: MOV warning bar ──────────────────────────────────────────── */}
                        {!meetsMinOrder && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                <div className="text-right flex-1">
                                    <p className="text-red-800 font-bold text-sm leading-relaxed">
                                        {locale === 'ar' 
                                            ? `عذراً، يجب أن يصل مجموع طلبك إلى 149 درهم لتأكيده. متبقي لك فقط ${remaining.toFixed(0)} درهم`
                                            : `Sorry, your order must reach 149 DH to confirm. Only ${remaining.toFixed(0)} DH remaining`
                                        }
                                    </p>
                                    <div className="mt-2">
                                        {/* Progress bar */}
                                        <div className="w-full bg-red-100 rounded-full h-2">
                                            <div
                                                className="bg-red-500 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${Math.min((subtotal / MIN_ORDER_VALUE) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <p className="text-red-600 text-xs mt-1 font-bold">
                                            {locale === 'ar'
                                                ? `المجموع الحالي: ${subtotal.toFixed(0)} درهم من ${MIN_ORDER_VALUE} درهم`
                                                : `Current: ${subtotal.toFixed(0)} DH of ${MIN_ORDER_VALUE} DH minimum`
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Total */}
                        <div className="flex justify-between items-center font-black text-lg border-t pt-3">
                            <span>{tCommon('total')}</span>
                            <span className="text-emerald-600">{total} {tCommon('currency')}</span>
                        </div>

                        {/* Checkout Button — disabled if MOV not met */}
                        <button
                            onClick={handleCheckout}
                            disabled={!meetsMinOrder}
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg active:scale-[0.98] transition flex items-center justify-center gap-2
                                ${meetsMinOrder
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 cursor-pointer'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'}`}
                        >
                            {meetsMinOrder
                                ? (locale === 'ar' ? 'أكد الطلب ←' : 'Confirm Order ←')
                                : (locale === 'ar' ? `الحد الأدنى: ${MIN_ORDER_VALUE} DH` : `Min Order: ${MIN_ORDER_VALUE} DH`)
                            }
                        </button>

                        <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                            <span className="block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            {locale === 'ar' ? 'توصيل مجاني • الدفع عند الاستلام' : 'Free Delivery • Cash on Delivery'}
                        </p>

                        {/* Continue Shopping Button */}
                        <button
                            onClick={() => {
                                closeCart();
                                // Navigate to main shop
                                window.location.href = `/${locale}`;
                            }}
                            className="w-full mt-2 py-3 border border-emerald-600 text-emerald-600 rounded-xl font-bold hover:bg-emerald-50 transition flex items-center justify-center gap-2"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            {locale === 'ar' ? 'متابعة التسوق' : 'Continue Shopping'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
