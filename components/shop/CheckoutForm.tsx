"use client";


import { useState, useEffect } from "react";
import { useShop, Product } from "@/context/ShopContext";
import { rtdb } from "@/lib/firebase";
import { ref, push, set } from "firebase/database";
import { Loader2, CheckCircle, Truck, MapPin, X } from "lucide-react";

import { useTranslations, useLocale } from "next-intl";
import Swal from "sweetalert2";

interface CheckoutFormProps {
    product: Product;
    className?: string;
}

export default function CheckoutForm({ product, className = "" }: CheckoutFormProps) {
    // @ts-ignore
    const { settings, getShippingCost, cart, clearCart, removeFromCart } = useShop();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: "", phone: "", city: "", address: "" });
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


    // COMBINED ORDER LOGIC: Current Product + Cart Items
    // If the current product is ALREADY in the cart, we use the cart version (to respect qty).
    // If not, we add it as a new item (qty 1).
    // Actually, "Direct Response" usually means "I want this specific item now". 
    // But if I have a cart, I probably want to checkout everything together.

    // Strategy: 
    // 1. Start with Cart Items.
    // 2. Check if 'product' is in Cart.
    // 3. If yes, use Cart Items as is (assuming user updated qty there, or we could increment). 
    //    *User Request*: "If there are items in the cart, it combines them with the current product".
    //    Let's ensure the current product is present.

    // Let's go with: Cart Items + Current Product (if not in cart).
    // If Current Product IS in cart, we just use the Cart set (so we don't duplicate).

    // State to track if the user manually dismisses the "current product" (Buy Now item)
    // This is needed because the "Buy Now" item might not be in the global cart yet.
    const [isProductDismissed, setIsProductDismissed] = useState(false);

    let items = [...cart];
    // Only add current product if:
    // 1. It's not already in the cart (to avoid dupes)
    // 2. It hasn't been dismissed by the user
    const isCurrentProductInCart = cart.some(item => item.id === product.id);

    if (!isCurrentProductInCart && !isProductDismissed) {
        items.push({ ...product, qty: 1 });
    }

    // Calculate totals
    const productTotal = items.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0);
    const finalTotal = productTotal + shippingCost;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.phone || !formData.city) return;

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
            items: items.map(i => `${i.title} (x${i.qty})`).join(", "),
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
                await set(ref(rtdb, `orders/${safeStoreName}/${orderID}`), { ...orderData, id: orderID });
            } catch (rtdbError) {
                console.error("RTDB Write Failed (Permission/Network)", rtdbError);
                // Continue execution - don't block user
            }

            // ---------------------------------------------------------
            // 🆕 CUSTOMER DATA COLLECTION (Firestore)
            // ---------------------------------------------------------
            try {
                // Normalized Phone (Remove spaces, dashes)
                const rawPhone = formData.phone.replace(/\D/g, '');
                const customerId = rawPhone.startsWith('212') ? rawPhone : `212${rawPhone.replace(/^0+/, '')}`;

                // Get Product Categories (Interests)
                const currentInterests = Array.from(new Set(items.map(i => i.category)));

                const { doc, setDoc, getDoc, serverTimestamp, increment, arrayUnion } = await import("firebase/firestore");
                const { db } = await import("@/lib/firebase");

                const customerRef = doc(db, "customers", customerId);
                const customerSnap = await getDoc(customerRef);

                if (customerSnap.exists()) {
                    // Update existing customer
                    await setDoc(customerRef, {
                        totalSpent: increment(finalTotal),
                        ordersCount: increment(1),
                        interests: arrayUnion(...currentInterests),
                        lastOrder: new Date().toISOString(),
                        city: formData.city || customerSnap.data().city || "",
                        name: formData.name || customerSnap.data().name || ""
                    }, { merge: true });
                } else {
                    // Create new customer
                    await setDoc(customerRef, {
                        id: customerId,
                        name: formData.name,
                        phone: formData.phone,
                        city: formData.city,
                        totalSpent: finalTotal,
                        ordersCount: 1,
                        interests: currentInterests,
                        lastOrder: new Date().toISOString()
                    });
                }
            } catch (err) {
                console.error("Failed to save customer data", err);
                // Non-blocking error
            }
            // ---------------------------------------------------------

            // 2. Telegram Trigger
            // @ts-ignore
            const telegramTargetId = settings.telegramNotificationId || settings.telegramId;

            try {
                // Ensure items string is generated exactly as needed
                const itemsString = items.map(i => `${typeof i.title === 'string' ? i.title : (i.title as any)[locale] || (i.title as any)['en']} (x${i.qty})`).join(", ");

                await fetch('/api/order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderDetails: {
                            name: formData.name,
                            phone: formData.phone,
                            total: finalTotal,
                            city: formData.city,
                            items: itemsString,
                            client: { address: formData.address }
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
                            content_ids: items.map(i => i.id),
                            content_name: items.map(i => i.title).join(', ')
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

            // 4. Success UI
            Swal.fire({
                icon: "success",
                title: t('success_title'),
                text: t('success_desc'),
                confirmButtonColor: "#10b981",
                confirmButtonText: t('thank_you')
            });

            // Reset form
            setFormData({ name: "", phone: "", city: "", address: "" });
            // Clear Cart
            clearCart();

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
                window.fbq('track', 'InitiateCheckout', {
                    content_ids: items.map(i => i.id),
                    content_type: 'product',
                    currency: 'MAD',
                    value: finalTotal,
                    num_items: items.length
                });
            }

            // TikTok
            // @ts-ignore
            if (window.ttq) {
                // @ts-ignore
                window.ttq.track('InitiateCheckout', {
                    contents: items.map(i => ({
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
                <label className="block text-xs font-bold text-gray-500 mb-1 mr-1">{t('address')}</label>
                <input
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-3.5 border rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition font-bold text-gray-900 shadow-sm"
                    placeholder={t('address')}
                />
            </div>

            {/* MINI-CART SUMMARY */}
            {/* CART SUMMARY - Improved UI */}
            {items.length > 0 && (
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4 animate-in fade-in zoom-in duration-300">
                    <h4 className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider border-b pb-2">
                        <span>Your Order ({items.length})</span>
                    </h4>

                    <div className="space-y-4 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                        {items.map((item, idx) => (
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

                                {/* Remove Button (Right-aligned, mostly visible on hover on desktop) */}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();

                                        // Logic: If in cart, remove from cart. If it's the current "Buy Now" product, dismiss it locally.
                                        if (cart.some(c => c.id === item.id)) {
                                            removeFromCart(item.id);
                                        } else if (item.id === product.id) {
                                            setIsProductDismissed(true);
                                        }
                                    }}
                                    className="absolute -top-1 -right-1 md:static md:top-auto md:right-auto text-gray-300 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                                    title="Remove item"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Privacy / Summary */}
            <div className="pt-2 border-t border-gray-100 space-y-2">
                <div className="flex justify-between items-center text-sm font-medium text-gray-600">
                    <span>{tCommon('price') || "Price"}:</span>
                    <span>{productTotal} DH</span>
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
            <p className="text-center text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
                {t('cod_hint')}
            </p>
        </form >
    );
}