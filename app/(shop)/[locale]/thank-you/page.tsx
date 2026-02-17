"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, ShoppingBag, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useShop } from "@/context/ShopContext";

export default function ThankYouPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const locale = useLocale();
    const { settings } = useShop();

    const orderId = searchParams.get("orderId");
    const total = searchParams.get("total");
    const [seconds, setSeconds] = useState(10);

    // Fire Purchase Event on Mount
    useEffect(() => {
        // Prevent duplicate firing if reloaded? 
        // Simple way: check sessionStorage
        const sessionKey = `tracked_${orderId}`;
        if (!sessionStorage.getItem(sessionKey) && orderId) {

            // Facebook Pixel
            // @ts-ignore
            if (window.fbq) {
                console.log("💰 Firing Client-Side Purchase Pixel");
                // @ts-ignore
                window.fbq('track', 'Purchase', {
                    currency: "MAD",
                    value: Number(total || 0),
                    content_ids: [orderId],
                    content_type: 'product'
                });
            }

            // TikTok Pixel
            // @ts-ignore
            if (window.ttq) {
                // @ts-ignore
                window.ttq.track('PlaceAnOrder', {
                    currency: "MAD",
                    value: Number(total || 0),
                    content_id: orderId
                });
            }

            sessionStorage.setItem(sessionKey, "true");
        }
    }, [orderId, total]);

    // WhatsApp Link
    const whatsappMessage = `Hello, I want to confirm my order #${orderId}`;
    const whatsappLink = `https://wa.me/${settings.whatsappPhone?.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6 animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-4">
                    <CheckCircle className="w-10 h-10" />
                </div>

                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">
                        {locale === 'ar' ? 'شكراً لطلبك!' : 'Thank You!'}
                    </h1>
                    <p className="text-gray-500">
                        {locale === 'ar' ? 'تم استلام طلبك بنجاح. سنتصل بك قريباً للتأكيد.' : 'Your order has been received. We will contact you shortly to confirm.'}
                    </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-gray-500">{locale === 'ar' ? 'رقم الطلب' : 'Order ID'}:</span>
                        <span className="font-bold text-gray-900 font-mono">{orderId || "N/A"}</span>
                    </div>
                    {total && (
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">{locale === 'ar' ? 'المجموع' : 'Total'}:</span>
                            <span className="font-bold text-emerald-600">{total} DH</span>
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    {/* WhatsApp CTA */}
                    {settings.whatsappPhone && (
                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-4 rounded-xl font-bold shadow-lg shadow-green-200 transition flex items-center justify-center gap-2"
                        >
                            <MessageCircle className="w-5 h-5" />
                            {locale === 'ar' ? 'أكد طلبك عبر واتساب' : 'Confirm via WhatsApp'}
                        </a>
                    )}

                    <Link
                        href={`/${locale}`}
                        className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition"
                    >
                        {locale === 'ar' ? 'العودة للمتجر' : 'Continue Shopping'}
                    </Link>
                </div>
            </div>
        </div>
    );
}
