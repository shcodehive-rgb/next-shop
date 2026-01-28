"use client";

import { useState } from "react";
import { useShop, Product } from "@/context/ShopContext";
import { rtdb } from "@/lib/firebase";
import { ref, push, set } from "firebase/database";
import { X, Loader2, CheckCircle, Package } from "lucide-react";
import Swal from "sweetalert2";

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    product?: Product;
}

export default function CheckoutModal({ isOpen, onClose, product }: CheckoutModalProps) {
    const { cart, settings, clearCart } = useShop();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: "", phone: "", city: "" });

    if (!isOpen) return null;

    // Logic: If product passed, buying that ONE item. Else buying CART.
    const items = product ? [{ ...product, qty: 1 }] : cart;
    const total = items.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0);
    const isEmpty = items.length === 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.phone) return;

        setLoading(true);
        const safeStoreName = (settings.storeName || "Store").replace(/[.#$/\[\]]/g, "_");

        const orderData = {
            createdAt: new Date().toISOString(),
            dateLocal: new Date().toLocaleString(),
            status: "New",
            storeName: settings.storeName,
            telegramId: settings.telegramId || "",
            client: formData,
            items: items.map(i => `${i.title} (x${i.qty})`).join(", "),
            total: total,
            shopSource: process.env.NEXT_PUBLIC_SHOP_NAME || 'default',
        };

        try {
            // 1. Save to Firebase
            const orderRef = push(ref(rtdb, `orders/${safeStoreName}`));
            await set(orderRef, orderData);

            // 2. Telegram Trigger (via Sheet if configured)
            if (settings.sheetUrl) {
                fetch(settings.sheetUrl, {
                    method: 'POST', mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...orderData, type: 'order' })
                }).catch(e => console.log("Notify Error"));
            }

            // 🚀 Send Telegram Notification
            if (settings.telegramId) {
                try {
                    await fetch('/api/order', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            orderData: {
                                id: orderRef.key,
                                customerName: formData.name,
                                customerPhone: formData.phone,
                                customerCity: formData.city,
                                items: items, // Pass the whole items array
                                total: total
                            },
                            merchantTelegramId: settings.telegramId
                        })
                    });
                    console.log("Telegram notification sent!");
                } catch (err) {
                    console.error("Failed to send Telegram notification", err);
                    // Don't block the user
                }
            }

            // 3. Success UI
            onClose();
            if (!product) clearCart();

            // Track 'Purchase'
            console.log("💰 Order Success! Firing Pixel Events...");

            // @ts-ignore
            if (window.fbq && settings.facebookPixelId) {
                // @ts-ignore
                window.fbq('track', 'Purchase', { value: total, currency: 'MAD' });
                console.log("✅ FB Purchase Event Sent");
            }
            // @ts-ignore
            if (window.ttq && settings.tiktokPixelId) {
                // @ts-ignore
                window.ttq.track('PlaceAnOrder', { value: total, currency: 'MAD' });
                console.log("✅ TikTok Purchase Event Sent");
            }

            Swal.fire({
                icon: "success",
                title: "تم استلام طلبك! 🎉",
                text: "سنتصل بك قريباً لتأكيد الطلبية.",
                confirmButtonColor: "#10b981",
                confirmButtonText: "شكراً"
            });

        } catch (e) {
            console.error(e);
            Swal.fire("خطأ", "حدث خطأ ما، يرجى المحاولة لاحقاً", "error");
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

                <h2 className="text-2xl font-black text-center mb-1 text-gray-900">إتمام الطلب</h2>
                <p className="text-center text-gray-500 text-sm mb-6">أدخل معلوماتك لنقوم بتوصيل طلبيتك</p>

                {isEmpty ? (
                    <div className="text-center py-10">
                        <Package className="w-16 h-16 mx-auto text-gray-200 mb-2" />
                        <p className="text-gray-400">السلة فارغة</p>
                    </div>
                ) : (
                    <>
                        {/* Summary */}
                        <div className="bg-gray-50 p-4 rounded-2xl mb-6 border border-gray-100">
                            <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                                {items.map(i => (
                                    <div key={i.id} className="flex justify-between text-sm">
                                        <span className="text-gray-700 font-medium truncate max-w-[200px]">{i.title} <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded text-gray-600">x{i.qty}</span></span>
                                        <span className="font-bold text-gray-900">{Number(i.price) * i.qty} DH</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center">
                                <span className="text-gray-500 text-sm">المجموع الكلي</span>
                                <span className="text-xl font-black text-emerald-600">{total} DH</span>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 mr-1">الاسم الكامل</label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-3.5 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition font-bold text-gray-900"
                                    placeholder="الاسم"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 mr-1">رقم الهاتف</label>
                                <input
                                    required type="tel"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full p-3.5 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition font-bold text-gray-900"
                                    placeholder="06XXXXXXXX"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 mr-1">المدينة</label>
                                <input
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full p-3.5 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition font-bold text-gray-900"
                                    placeholder="المدينة"
                                />
                            </div>

                            <button
                                disabled={loading}
                                className="w-full bg-black text-white py-4 rounded-xl font-black text-lg hover:bg-gray-900 shadow-xl shadow-gray-200 active:scale-95 transition flex items-center justify-center gap-2 mt-4"
                            >
                                {loading ? <Loader2 className="animate-spin" /> :
                                    <>
                                        <span>تأكيد الطلب الآن</span>
                                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                                    </>
                                }
                            </button>
                            <p className="text-center text-xs text-gray-400 mt-2">الدفع عند الاستلام • توصيل سريع</p>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
