"use client";

import { useState } from "react";
import { useShop, Product } from "@/context/ShopContext";
import { rtdb } from "@/lib/firebase";
import { ref, push, set } from "firebase/database";
import { Loader2, CheckCircle } from "lucide-react";
import Swal from "sweetalert2";

interface CheckoutFormProps {
    product: Product;
}

export default function CheckoutForm({ product }: CheckoutFormProps) {
    // @ts-ignore
    const { settings } = useShop();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: "", phone: "", city: "" });

    // Single product buy logic
    const items = [{ ...product, qty: 1 }];
    const total = items.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0);

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
            // @ts-ignore
            telegramId: settings.telegramNotificationId || settings.telegramId || "",
            client: formData,
            items: items.map(i => `${i.title} (x${i.qty})`).join(", "),
            total: total,
            shopSource: process.env.NEXT_PUBLIC_SHOP_NAME || 'default',
        };

        try {
            // 1. Save to Firebase
            const orderRef = push(ref(rtdb, `orders/${safeStoreName}`));
            await set(orderRef, orderData);

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
                            total: total
                        }
                    })
                });
            } catch (err) {
                console.error("Notify Error", err);
            }

            // 3. Analytics & Pixels
            console.log("💰 Order Success! Firing Pixel Events...");
            // @ts-ignore
            if (window.fbq && settings.facebookPixelId) {
                // @ts-ignore
                window.fbq('track', 'Purchase', { value: total, currency: 'MAD' });
            }
            // @ts-ignore
            if (window.ttq && settings.tiktokPixelId) {
                // @ts-ignore
                window.ttq.track('PlaceAnOrder', { value: total, currency: 'MAD' });
            }

            // 4. Success UI
            Swal.fire({
                icon: "success",
                title: "تم استلام طلبك! 🎉",
                text: "سنتصل بك قريباً لتأكيد الطلبية.",
                confirmButtonColor: "#10b981",
                confirmButtonText: "شكراً"
            });

            // Reset form
            setFormData({ name: "", phone: "", city: "" });

        } catch (e) {
            console.error(e);
            Swal.fire("خطأ", "حدث خطأ ما، يرجى المحاولة لاحقاً", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
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
                        <span>تأكيد الطلب الآن (Ordered)</span>
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                    </>
                }
            </button>
            <p className="text-center text-xs text-gray-400 mt-2">عروض خاصة • كمية محدودة</p>
        </form>
    );
}