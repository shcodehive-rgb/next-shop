"use client";


import { useState, useEffect } from "react";
import { useShop, Product } from "@/context/ShopContext";
import { rtdb } from "@/lib/firebase";
import { ref as dbRef, push, set } from "firebase/database";
import { Loader2, CheckCircle, Truck, MapPin, X, ShieldCheck, BadgeCheck } from "lucide-react";
import { useRouter } from "next/navigation";

import { useTranslations, useLocale } from "next-intl";
import Swal from "sweetalert2";

// ── Business Rules ────────────────────────────────────────────────────────────
const MIN_ORDER_VALUE = 149;  // DH — block checkout below this

export interface CheckoutFormProps {
    product?: Product; // Kept for backward compat if needed, but directItem is better
    className?: string;
    directOrder?: {
        items: any[];
        total: number;
    };
    onAddToCart?: () => void;
}

export default function CheckoutForm({ product, className = "", directOrder, onAddToCart }: CheckoutFormProps) {
    // @ts-ignore
    const { settings, getShippingCost, cart, clearCart, removeFromCart, openCart } = useShop();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: "", phone: "", city: "", address: "" });
    const router = useRouter();
    const t = useTranslations('Checkout');
    const tCommon = useTranslations('Common');
    const locale = useLocale();

    const getLocalizedTitle = (title: any) => {
        if (typeof title === 'string') return title;
        if (typeof title === 'object' && title !== null) {
            return title[locale] || title['ar'] || title['en'] || title['fr'] || "Product";
        }
        return "Product";
    };

    // Shipping Logic
    const [shippingCost, setShippingCost] = useState(0);

    // Updates shipping cost when city changes
    useEffect(() => {
        if (settings.shippingMode === 'custom' && formData.city) {
            const cost = getShippingCost(formData.city.trim());
            setShippingCost(cost);
        } else {
            setShippingCost(0);
        }
    }, [formData.city, settings.shippingMode, getShippingCost]);


    // ORDER ITEM LOGIC
    // If directOrder is provided, use IT.
    // Otherwise, use Cart.

    // We only use the cart if directOrder is NOT present.
    const itemsToOrder = directOrder ? directOrder.items : cart;
    const itemsTotal = directOrder ? directOrder.total : cart.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0);

    const finalTotal = itemsTotal + shippingCost;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.phone || !formData.city) return;

        // Check Minimum Order Value
        if (itemsTotal < MIN_ORDER_VALUE) {
            const remaining = MIN_ORDER_VALUE - itemsTotal;
            Swal.fire({
                icon: 'info',
                title: locale === 'ar' ? 'خطوة بسيطة لتأكيد طلبك!' : 'A simple step to confirm your order!',
                html: `
                    <div style="text-align: ${locale === 'ar' ? 'right' : 'left'}; direction: ${locale === 'ar' ? 'rtl' : 'ltr'};">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
                            <span style="font-size: 24px;">🎁</span>
                            <span style="color: #10b981; font-weight: bold; font-size: 16px;">
                                ${locale === 'ar' ? 'لضمان أفضل خدمة، المنتجات التي يقل سعرها عن 149 درهم تُباع كإضافة لطلبات أخرى.' : 'For the best service, products under 149 DH are sold as add-ons to other orders.'}
                            </span>
                        </div>
                        <div style="margin-bottom: 16px; line-height: 1.5;">
                            <span style="color: #374151;">
                                ${locale === 'ar'
                        ? `أضف المزيد من المنتجات بقيمة <span style="color: #ef4444; font-weight: bold;">${remaining.toFixed(0)} درهم</span> لتأكيد طلبك.`
                        : `Add more products worth <span style="color: #ef4444; font-weight: bold;">${remaining.toFixed(0)} DH</span> to confirm your order.`
                    }
                            </span>
                        </div>
                    </div>
                `,
                confirmButtonText: locale === 'ar' ? 'أضف منتجات أخرى' : 'Add More Products',
                confirmButtonColor: '#10b981',
                showCancelButton: true,
                cancelButtonText: locale === 'ar' ? 'أضف للسلة' : 'Go to Cart',
                cancelButtonColor: '#6b7280',
                reverseButtons: locale === 'ar'
            }).then((result: any) => {
                if (result.isDismissed) {
                    // "أضف للسلة" clicked — add item to cart then open drawer
                    if (onAddToCart) {
                        onAddToCart(); // already calls addToCart(product, variant, qty) + openCart()
                    } else {
                        openCart();
                    }
                }
            });
            setLoading(false);
            return;
        }

        setLoading(true);
        const safeStoreName = (settings.storeName || "Store").replace(/[.#$/\[\]]/g, "_");

        const orderData = {
            createdAt: new Date().toISOString(),
            dateLocal: new Date().toLocaleString(),
            status: "New",
            storeName: settings.storeName,
            // @ts-ignore
            telegramId: settings.telegramNotificationId || settings.telegramId || "",
            client: {
                name: formData.name,
                phone: formData.phone,
                city: formData.city,
                address: formData.address
            },
            items: itemsToOrder.map(i => `${i.title} (x${i.qty})${i.selectedVariant ? ` [${i.selectedVariant}]` : ''}`).join(", "),
            total: finalTotal, // Use Final Total including shipping
            shippingCost: shippingCost,
            shopSource: settings.storeName || 'Unknown Shop',
        };

        try {
            // 1. Obfuscated Order ID (Anti-Spying)
            // Generates: ORD-X79Z2 (Random 5 chars)
            const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
            const orderID = `ORD-${randomCode}`;

            // Save using custom ID (not push ID)
            try {
                await set(dbRef(rtdb, `orders/${safeStoreName}/${orderID}`), { ...orderData, id: orderID });
            } catch (rtdbError) {
                console.error("RTDB Write Failed (Permission/Network)", rtdbError);
                // Continue execution - don't block user
            }

            // ── Save to localStorage so product page can show inline tracking stepper ──
            try {
                const productIds = itemsToOrder.map((i: any) => i.id).filter(Boolean);
                const existing: any[] = JSON.parse(localStorage.getItem("activeOrders") || "[]");
                existing.push({
                    orderId: orderID,
                    productIds,
                    storeName: safeStoreName,
                    createdAt: new Date().toISOString(),
                });
                localStorage.setItem("activeOrders", JSON.stringify(existing));
            } catch (_) {
                // localStorage may not be available — non-blocking
            }

            // ---------------------------------------------------------
            // 🆕 CUSTOMER DATA COLLECTION (Firestore Server Action)
            // ---------------------------------------------------------
            try {
                // Normalized Phone (Remove spaces, dashes)
                const rawPhone = formData.phone.replace(/\D/g, '');
                const customerId = rawPhone.startsWith('212') ? rawPhone : `212${rawPhone.replace(/^0+/, '')}`;

                // Get Product Categories (Interests)
                // @ts-ignore
                const currentInterests = Array.from(new Set(itemsToOrder.map(i => i.category || "General")));

                const { recordCustomerPurchase } = await import("@/app/actions/checkout");
                await recordCustomerPurchase({
                    id: customerId,
                    name: formData.name,
                    phone: formData.phone,
                    city: formData.city,
                    totalSpent: finalTotal,
                    interests: currentInterests as string[]
                });
            } catch (err) {
                console.error("Failed to save customer data via server action", err);
                // Non-blocking error
            }
            // ---------------------------------------------------------

            // 2. Telegram Trigger
            // @ts-ignore
            const telegramTargetId = settings.telegramNotificationId || settings.telegramId;

            try {
                await fetch('/api/order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderDetails: {
                            name: formData.name,
                            phone: formData.phone,
                            city: formData.city,
                            address: formData.address,           // top-level for server template
                            // Pass full title objects so server always picks Arabic
                            items: itemsToOrder.map((i: any) => ({ title: i.title, qty: i.qty })),
                            total: finalTotal,
                            shippingCost: shippingCost,
                        }
                    })
                });
            } catch (err) {
                console.error("Notify Error", err);
            }

            // 3. Analytics & Pixels (Hybrid: Browser + Server)
            const eventID = crypto.randomUUID ? crypto.randomUUID() : `order_${Date.now()}`;
            console.log("💰 Order Success! Firing Hybrid Events...", eventID);

            // A. Browser Pixel (REMOVED for Security - Server-Side Only)
            // if (window.fbq) { ... }

            // B. Server-Side CAPI (The 100% Tracking Fix)
            try {
                fetch('/api/fb-conversion', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        event_name: 'Purchase',
                        event_id: eventID,
                        user_data: {
                            phone: formData.phone,
                            city: formData.city,
                            client_user_agent: navigator.userAgent,
                            client_ip_address: '0.0.0.0'
                        },
                        custom_data: {
                            value: finalTotal,
                            currency: 'MAD',
                            content_ids: itemsToOrder.map((i: any) => i.id),
                            content_name: itemsToOrder.map((i: any) => i.title).join(', ')
                        }
                    })
                });
            } catch (err) {
                console.error("CAPI Trigger Failed", err);
            }

            // @ts-ignore
            if (window.ttq && settings.tiktokPixelId) {
                // @ts-ignore
                window.ttq.track('PlaceAnOrder', { value: finalTotal, currency: 'MAD' });
            }

            // 4. Redirect to Thank You Page
            router.push(`/${locale}/thank-you?orderId=${orderID}&total=${finalTotal}`);

            // Reset form
            setFormData({ name: "", phone: "", city: "", address: "" });

            // Clear Cart ONLY if strictly using cart (not direct order)
            if (!directOrder) {
                clearCart();
            }

        } catch (e) {
            console.error(e);
            Swal.fire(t('error_title'), t('error_desc'), "error");
        } finally {
            setLoading(false);
        }
    };

    // 📊 PIXEL TRACKING: InitiateCheckout
    const [hasInitiatedCheckout, setHasInitiatedCheckout] = useState(false);

    const handleInputFocus = () => {
        if (!hasInitiatedCheckout) {
            setHasInitiatedCheckout(true);

            // Facebook
            // @ts-ignore
            if (window.fbq) {
                // @ts-ignore
                // @ts-ignore
                window.fbq('track', 'InitiateCheckout', {
                    content_ids: itemsToOrder.map((i: any) => i.id),
                    content_type: 'product',
                    currency: 'MAD',
                    value: finalTotal,
                    num_items: itemsToOrder.length
                });
            }

            // TikTok
            // @ts-ignore
            if (window.ttq) {
                // @ts-ignore
                // @ts-ignore
                window.ttq.track('InitiateCheckout', {
                    contents: itemsToOrder.map((i: any) => ({
                        content_id: i.id,
                        content_name: i.title,
                        quantity: i.qty,
                        price: i.price
                    })),
                    value: finalTotal,
                    currency: 'MAD'
                });
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className={`space-y-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 ${className}`}>

            {/* Input Fields */}
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 mr-1">{t('name')}</label>
                <input
                    required
                    value={formData.name}
                    onFocus={handleInputFocus}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3.5 border rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition font-bold text-gray-900 shadow-sm"
                    placeholder={t('name')}
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 mr-1">{t('phone')}</label>
                <input
                    required type="tel"
                    value={formData.phone}
                    onFocus={handleInputFocus}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-3.5 border rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition font-bold text-gray-900 shadow-sm"
                    placeholder="06XXXXXXXX"
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 mr-1">{t('city')}</label>
                <div className="relative">
                    <MapPin className="absolute top-4 left-3 w-5 h-5 text-gray-400 pointer-events-none rtl:right-3 rtl:left-auto" />
                    <input
                        value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                        className="w-full p-3.5 border rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition font-bold text-gray-900 shadow-sm pl-10 rtl:pr-10 rtl:pl-3"
                        placeholder={t('city')}
                        required
                    />
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 mr-1">
                    {t('address')} <span className="text-gray-400 font-normal">({locale === 'ar' ? 'اختياري' : 'Optional'})</span>
                </label>
                <input
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-3.5 border rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition font-bold text-gray-900 shadow-sm"
                    placeholder={locale === 'ar' ? 'العنوان (اختياري)' : 'Address (Optional)'}
                />
            </div>

            {/* Trust Badges (CRO) */}
            <div className="grid grid-cols-2 gap-3 py-2">
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-white p-2 rounded-lg border border-gray-100">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    <span>{locale === 'ar' ? 'توصيل سريع' : 'Fast Delivery'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-white p-2 rounded-lg border border-gray-100">
                    <BadgeCheck className="w-4 h-4 text-emerald-600" />
                    <span>{locale === 'ar' ? 'ضمان الجودة' : 'Quality Guarantee'}</span>
                </div>
            </div>

            {/* MINI-CART SUMMARY */}
            {/* Show only if using Cart (directOrder usually implies "What you see is what you get" above) */}
            {/* User requested to REMOVE summary for Inline Form (directOrder) */}
            {!directOrder && itemsToOrder.length > 0 && (
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4 animate-in fade-in zoom-in duration-300">
                    <h4 className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider border-b pb-2">
                        <span>Your Order ({itemsToOrder.length})</span>
                    </h4>

                    <div className="space-y-4 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                        {itemsToOrder.map((item: any, idx: number) => (
                            <div key={`${item.id}-${idx}`} className="flex items-start gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0 relative group">

                                {/* Image */}
                                <div className="relative shrink-0">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-100">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={typeof item.title === 'string' ? item.title : (item.title as any)[locale] || (item.title as any)['en'] || 'Product'}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <Loader2 className="w-5 h-5" />
                                            </div>
                                        )}
                                    </div>
                                    <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm ring-2 ring-white">
                                        {item.qty}
                                    </span>
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0 flex flex-col justify-between h-16">
                                    <h5 className="text-gray-900 font-bold text-sm leading-tight line-clamp-2" title={getLocalizedTitle(item.title)}>
                                        {getLocalizedTitle(item.title)}
                                    </h5>
                                    {/* @ts-ignore */}
                                    {item.selectedOptions && (
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {/* @ts-ignore */}
                                            {Object.values(item.selectedOptions).join(', ')}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-gray-500 text-xs">{Number(item.price)} DH <span className="text-[10px]">/ unit</span></span>
                                    <span className="text-emerald-700 font-bold text-sm">{Number(item.price) * item.qty} DH</span>
                                </div>

                                {/* Remove Button (Only for Cart mode) */}
                                {!directOrder && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (cart.some(c => c.id === item.id)) {
                                                removeFromCart(item.id);
                                            }
                                        }}
                                        className="absolute -top-1 -right-1 md:static md:top-auto md:right-auto text-gray-300 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                                        title="Remove item"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Privacy / Summary */}
            <div className="pt-2 border-t border-gray-100 space-y-2">
                <div className="flex justify-between items-center text-sm font-medium text-gray-600">
                    <span>{tCommon('price') || "Price"}:</span>
                    <span>{itemsTotal} DH</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium text-gray-600">
                    <span className="flex items-center gap-1"><Truck className="w-4 h-4" /> {tCommon('shipping') || "Shipping"}:</span>
                    <span className={shippingCost === 0 ? "text-emerald-600 font-bold" : "text-gray-900"}>
                        {shippingCost === 0 ? (t('free_shipping') || "Free") : `+${shippingCost} DH`}
                    </span>
                </div>
                <div className="flex justify-between items-center text-lg font-black text-gray-900 pt-2 border-t">
                    <span>{tCommon('total') || "Total"}:</span>
                    <span>{finalTotal} DH</span>
                </div>
            </div>

            <button
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black text-xl hover:bg-emerald-700 shadow-xl shadow-emerald-200 active:scale-95 transition flex items-center justify-center gap-2 mt-4 animate-in slide-in-from-bottom-2 duration-700"
            >
                {loading ? <Loader2 className="animate-spin" /> :
                    <>
                        <span>{t('submit')}</span>
                        <CheckCircle className="w-6 h-6" />
                    </>
                }
            </button>

            {/* Secondary: Add to Cart (Only if prop provided) */}
            {onAddToCart && (
                <button
                    type="button"
                    onClick={onAddToCart}
                    className="w-full bg-transaprent border-2 border-emerald-600 text-emerald-700 py-3 rounded-xl font-bold text-lg hover:bg-emerald-50 active:scale-95 transition flex items-center justify-center gap-2 mt-3"
                >
                    <span>{locale === 'ar' ? 'أضف إلى السلة' : 'Add to Cart'}</span>
                </button>
            )}

            <p className="text-center text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
                {t('cod_hint')}
            </p>
        </form >
    );
}