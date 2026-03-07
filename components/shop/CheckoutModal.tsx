"use client";

import { useState } from "react";
import { useShop, Product } from "@/context/ShopContext";
import { rtdb } from "@/lib/firebase";
import { ref, push, set } from "firebase/database";
import { X, Loader2, CheckCircle, Package } from "lucide-react";
import Swal from "sweetalert2";
import { useTranslations } from "next-intl";
import { getProductTitle } from "@/lib/utils";

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    product?: Product;
}

export default function CheckoutModal({ isOpen, onClose, product }: CheckoutModalProps) {
    const { cart, settings, clearCart } = useShop();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: "", phone: "", city: "" });
    const t = useTranslations('Checkout');
    const tCommon = useTranslations('Common');

    if (!isOpen) return null;

    // Logic: If product passed, buying that ONE item. Else buying CART.
    const items = product ? [{ ...product, qty: 1 }] : cart;
    const total = items.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0);
    const isEmpty = items.length === 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.phone || !formData.city) return;

        setLoading(true);
        const safeStoreName = (settings.storeName || "Store").replace(/[.#$/\[\]]/g, "_");

        const orderData = {
            createdAt: new Date().toISOString(),
            dateLocal: new Date().toLocaleString(),
            status: "pending",
            storeName: settings.storeName,
            telegramId: settings.telegramId || "",
            client: formData,
            items: items.map(i => `${getProductTitle(i.title)}${i.selectedVariant ? ` [${i.selectedVariant}]` : ''} (x${i.qty})`).join(", "),
            total: total,
            shopSource: settings.storeName || 'Unknown Shop',
        };

        try {
            // 0. Ensure Auth (Fixes PERMISSION_DENIED)
            const { auth } = await import("@/lib/firebase");
            const { signInAnonymously } = await import("firebase/auth");

            if (!auth.currentUser) {
                console.log("⏳ CheckoutModal: Waiting for Auth...");
                await signInAnonymously(auth);
                console.log("✅ CheckoutModal: Authenticated");
            }

            // 1. Obfuscated Order ID (Anti-Spying)
            const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
            const orderID = `ORD-${randomCode}`;

            await set(ref(rtdb, `orders/${safeStoreName}/${orderID}`), { ...orderData, id: orderID });

            // ---------------------------------------------------------
            // 🆕 CUSTOMER DATA COLLECTION (Firestore)
            // ---------------------------------------------------------
            try {
                // Normalized Phone
                // @ts-ignore
                const rawPhone = formData.phone.replace(/\D/g, '');
                const customerId = rawPhone.startsWith('212') ? rawPhone : `212${rawPhone.replace(/^0+/, '')}`;

                // Get Product Categories
                // @ts-ignore
                const currentInterests = product?.category ? [product.category] : [];
                // If cart check needed later, can expand. For modal it's usually single product or we use 'items' if available. 
                // CheckoutModal seems to handle single product prop usually or cart?
                // Checking code... it takes `product` prop.

                const { doc, setDoc, getDoc, serverTimestamp, increment, arrayUnion } = await import("firebase/firestore");
                const { db } = await import("@/lib/firebase");

                const customerRef = doc(db, "customers", customerId);
                const customerSnap = await getDoc(customerRef);

                if (customerSnap.exists()) {
                    await setDoc(customerRef, {
                        totalSpent: increment(total),
                        ordersCount: increment(1),
                        interests: arrayUnion(...currentInterests),
                        lastOrder: new Date().toISOString(),
                        city: formData.city || customerSnap.data().city || "",
                        name: formData.name || customerSnap.data().name || ""
                    }, { merge: true });
                } else {
                    await setDoc(customerRef, {
                        id: customerId,
                        name: formData.name,
                        phone: formData.phone,
                        city: formData.city,
                        totalSpent: total,
                        ordersCount: 1,
                        interests: currentInterests,
                        lastOrder: new Date().toISOString()
                    });
                }
            } catch (err) {
                console.error("Failed to save customer data", err);
            }
            // ---------------------------------------------------------

            // 2. Telegram Trigger (via Sheet if configured)
            if (settings.sheetUrl) {
                fetch(settings.sheetUrl, {
                    method: 'POST', mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...orderData, type: 'order' })
                }).catch(e => console.log("Notify Error"));
            }

            // 🚀 Send Telegram Notification
            try {
                await fetch('/api/order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderDetails: {
                            name: formData.name,
                            phone: formData.phone,
                            city: formData.city,
                            address: (formData as any).address || '',
                            // Pass full title objects — server extracts Arabic
                            items: items.map(i => ({ title: i.title, qty: i.qty })),
                            total: total,
                            shippingCost: 0,
                        }
                    })
                });
                console.log("Telegram notification sent!");
            } catch (err) {
                console.error("Failed to send Telegram notification", err);
            }

            // 3. Success UI
            onClose();
            if (!product) clearCart();

            // 3. Analytics & Pixels (Hybrid: Browser + Server)
            const eventID = crypto.randomUUID ? crypto.randomUUID() : `order_${Date.now()}`;
            console.log("💰 Order Success! Firing Hybrid Events...", eventID);

            // A. Browser Pixel (with Event ID for Deduplication)
            // @ts-ignore
            if (window.fbq) {
                // @ts-ignore
                window.fbq('track', 'Purchase', {
                    value: total,
                    currency: 'MAD',
                    content_name: items.map(i => getProductTitle(i.title)).join(', '),
                    content_ids: items.map(i => i.id),
                    content_type: 'product',
                    user_data: {
                        ph: formData.phone
                    }
                }, { eventID: eventID }); // <--- Deduplication Key
                console.log("✅ FB Browser Purchase Sent");
            }

            // B. Server-Side CAPI (always fires — uses env-var credentials)
            fetch('/api/meta-events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event_name: 'Purchase',
                    event_id: eventID, // deduplication key matches browser pixel above
                    event_source_url: window.location.href,
                    phone: formData.phone,
                    custom_data: {
                        value: total,
                        currency: 'MAD',
                        content_ids: items.map(i => i.id),
                        content_type: 'product',
                        content_name: items.map(i => getProductTitle(i.title)).join(', ')
                    }
                })
            }).catch(err => console.error('CAPI Purchase Error:', err));
            console.log('✅ FB CAPI Purchase Sent', eventID);

            // @ts-ignore
            if (window.ttq && settings.tiktokPixelId) {
                // @ts-ignore
                window.ttq.track('PlaceAnOrder', { value: total, currency: 'MAD' });
                console.log("✅ TikTok Purchase Event Sent");
            }

            Swal.fire({
                icon: "success",
                title: t('success_title'),
                text: t('success_desc'),
                confirmButtonColor: "#10b981",
                confirmButtonText: t('thank_you')
            });

        } catch (e) {
            console.error(e);
            Swal.fire(t('error_title'), t('error_desc'), "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 font-[Tajawal]">

            {/* Card */}
            <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-in slide-in-from-bottom-4 zoom-in-95 duration-200">

                {/* Close */}
                <button onClick={onClose} className="absolute top-4 left-4 p-2 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-500 transition z-10">
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-black text-center mb-1 text-gray-900">{t('title')}</h2>
                <p className="text-center text-gray-500 text-sm mb-6">{t('description')}</p>

                {isEmpty ? (
                    <div className="text-center py-10">
                        <Package className="w-16 h-16 mx-auto text-gray-200 mb-2" />
                        <p className="text-gray-400">{t('empty_cart')}</p>
                    </div>
                ) : (
                    <>
                        {/* Summary */}
                        <div className="bg-gray-50 p-4 rounded-2xl mb-6 border border-gray-100">
                            <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                                {items.map(i => (
                                    <div key={i.id} className="flex justify-between text-sm">
                                        <span className="text-gray-700 font-medium truncate max-w-[200px]">{getProductTitle(i.title)} <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded text-gray-600">x{i.qty}</span></span>
                                        <span className="font-bold text-gray-900">{Number(i.price) * i.qty} {tCommon('currency')}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center">
                                <span className="text-gray-500 text-sm">{t('total')}</span>
                                <span className="text-xl font-black text-emerald-600">{total} {tCommon('currency')}</span>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 mr-1">{t('name')}</label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-3.5 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition font-bold text-gray-900"
                                    placeholder={t('name')}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 mr-1">{t('phone')}</label>
                                <input
                                    required type="tel"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full p-3.5 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition font-bold text-gray-900"
                                    placeholder="06XXXXXXXX"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 mr-1">{t('city')}</label>
                                <input
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full p-3.5 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition font-bold text-gray-900"
                                    placeholder={t('city')}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 mr-1">{t('address')}</label>
                                <input
                                    className="w-full p-3.5 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition font-bold text-gray-900"
                                    placeholder={t('address')}
                                />
                            </div>

                            <button
                                disabled={loading}
                                className="w-full bg-black text-white py-4 rounded-xl font-black text-lg hover:bg-gray-900 shadow-xl shadow-gray-200 active:scale-95 transition flex items-center justify-center gap-2 mt-4"
                            >
                                {loading ? <Loader2 className="animate-spin" /> :
                                    <>
                                        <span>{t('submit')}</span>
                                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                                    </>
                                }
                            </button>
                            <p className="text-center text-xs text-gray-400 mt-2">{t('cod_hint')}</p>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
