"use client";

import { useState, useEffect, useRef } from "react";
import { rtdb } from "@/lib/firebase";
import { ref, query, orderByChild, equalTo, onValue, off } from "firebase/database";
import { useShop } from "@/context/ShopContext";
import { useLocale } from "next-intl";
import { Truck, Package, CheckCircle, Clock, XCircle, Search, Loader2, Phone } from "lucide-react";

// ── Status config ─────────────────────────────────────────────────────────────
const STATUSES = [
    { key: "pending", labelAr: "قيد الانتظار", labelFr: "En attente", icon: Clock, color: "text-yellow-500", bg: "bg-yellow-100", border: "border-yellow-400" },
    { key: "confirmed", labelAr: "تم التأكيد", labelFr: "Confirmée", icon: CheckCircle, color: "text-blue-500", bg: "bg-blue-100", border: "border-blue-400" },
    { key: "shipped", labelAr: "في الطريق إليك", labelFr: "En livraison", icon: Truck, color: "text-purple-500", bg: "bg-purple-100", border: "border-purple-400" },
    { key: "delivered", labelAr: "تم التوصيل ✅", labelFr: "Livré ✅", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-500" },
    { key: "cancelled", labelAr: "ملغية", labelFr: "Annulée", icon: XCircle, color: "text-red-500", bg: "bg-red-100", border: "border-red-400" },
] as const;

type StatusKey = (typeof STATUSES)[number]["key"];

const TIMELINE_KEYS: StatusKey[] = ["pending", "confirmed", "shipped", "delivered"];

function getStatusConfig(key: string) {
    return STATUSES.find(s => s.key === key) ?? STATUSES[0];
}

interface OrderResult {
    id: string;
    client: { name: string; phone: string; city: string; address?: string };
    items: string;
    total: number;
    status: string;
    createdAt: string;
}

export default function TrackOrderPage() {
    const { settings } = useShop();
    const locale = useLocale();
    const isAr = locale === "ar";

    const [phone, setPhone] = useState("");
    const [order, setOrder] = useState<OrderResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [searched, setSearched] = useState(false);
    const rtdbListenerRef = useRef<ReturnType<typeof ref> | null>(null);

    // Cleanup listener on unmount
    useEffect(() => {
        return () => {
            if (rtdbListenerRef.current) off(rtdbListenerRef.current);
        };
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = phone.trim().replace(/\s/g, "");
        if (!trimmed) return;

        setLoading(true);
        setError("");
        setOrder(null);
        setSearched(true);

        // Detach any previous listener
        if (rtdbListenerRef.current) off(rtdbListenerRef.current);

        const safeStoreName = (settings.storeName || "Store").replace(/[.#$\/\[\]]/g, "_");
        console.log("🔍 Debug - Store name:", settings.storeName, "Safe name:", safeStoreName);
        console.log("🔍 Debug - Phone number:", trimmed);
        
        const ordersRef = ref(rtdb, `orders/${safeStoreName}`);
        const q = query(ordersRef, orderByChild("client/phone"), equalTo(trimmed));
        
        console.log("🔍 Debug - Query path:", `orders/${safeStoreName}`);

        // Use onValue for real-time updates
        onValue(q, (snap) => {
            setLoading(false);
            if (!snap.exists()) {
                setError(isAr ? "لم يتم العثور على أي طلب بهذا الرقم." : "No order found for this phone number.");
                setOrder(null);
                return;
            }

            // Pick the LATEST order (highest createdAt)
            const allOrders: OrderResult[] = [];
            snap.forEach(child => {
                allOrders.push({ id: child.key!, ...child.val() });
            });
            allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setOrder(allOrders[0]);
        }, (err) => {
            setLoading(false);
            console.error("🔥 RTDB query error:", err);
            console.error("🔥 Error details:", {
                code: (err as any).code,
                message: err.message,
                path: `orders/${safeStoreName}`,
                phone: trimmed
            });
            setError(isAr ? "حدث خطأ. يرجى المحاولة مرة أخرى." : "An error occurred. Please try again.");
        });

        rtdbListenerRef.current = q as any;
    };

    const currentStatusConfig = order ? getStatusConfig(order.status) : null;
    const isCancelled = order?.status === "cancelled";
    const currentTimelineIndex = TIMELINE_KEYS.indexOf((order?.status ?? "pending") as StatusKey);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white font-tajawal" dir={isAr ? "rtl" : "ltr"}>
            <div className="max-w-2xl mx-auto px-4 py-16">

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-4">
                        <Truck className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">
                        {isAr ? "تتبع طلبيتك" : "Track Your Order"}
                    </h1>
                    <p className="text-gray-500">
                        {isAr
                            ? "أدخل رقم هاتفك لمعرفة حالة آخر طلبية لك"
                            : "Enter your phone number to see your latest order status"}
                    </p>
                </div>

                {/* Search form */}
                <form onSubmit={handleSearch} className="flex gap-2 mb-8">
                    <div className="flex-1 relative">
                        <Phone className="absolute top-3.5 ltr:left-3 rtl:right-3 w-5 h-5 text-gray-400 pointer-events-none" />
                        <input
                            type="tel"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder={isAr ? "06XXXXXXXX" : "06XXXXXXXX"}
                            className="w-full ltr:pl-10 rtl:pr-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 text-sm font-bold transition"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold text-sm transition active:scale-95"
                    >
                        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Search className="w-4 h-4" />}
                        {isAr ? "بحث" : "Search"}
                    </button>
                </form>

                {/* Error */}
                {error && (
                    <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 mb-6">
                        <XCircle className="w-5 h-5 shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {/* Result */}
                {order && currentStatusConfig && (
                    <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Status banner */}
                        <div className={`${currentStatusConfig.bg} px-6 py-4 flex items-center gap-3`}>
                            <currentStatusConfig.icon className={`w-6 h-6 ${currentStatusConfig.color}`} />
                            <div>
                                <p className="text-xs text-gray-500 font-medium">
                                    {isAr ? "حالة الطلبية" : "Order Status"}
                                </p>
                                <p className={`text-lg font-black ${currentStatusConfig.color}`}>
                                    {isAr ? currentStatusConfig.labelAr : currentStatusConfig.labelFr}
                                </p>
                            </div>
                            <span className="ltr:ml-auto rtl:mr-auto text-xs font-mono text-gray-400 bg-white/70 px-2 py-1 rounded-lg">
                                {order.id}
                            </span>
                        </div>

                        {/* Timeline (only for non-cancelled) */}
                        {!isCancelled && (
                            <div className="px-6 py-6">
                                <div className="flex items-center justify-between relative">
                                    {/* connecting line */}
                                    <div className="absolute top-5 ltr:left-5 rtl:right-5 ltr:right-5 rtl:left-5 h-0.5 bg-gray-200 z-0" style={{ left: "1.25rem", right: "1.25rem" }} />
                                    {TIMELINE_KEYS.map((key, idx) => {
                                        const cfg = getStatusConfig(key);
                                        const done = idx <= currentTimelineIndex;
                                        const Icon = cfg.icon;
                                        return (
                                            <div key={key} className="flex flex-col items-center gap-2 z-10 flex-1">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${done ? `${cfg.bg} ${cfg.border}` : "bg-white border-gray-200"}`}>
                                                    <Icon className={`w-5 h-5 ${done ? cfg.color : "text-gray-300"}`} />
                                                </div>
                                                <span className={`text-xs font-bold text-center leading-tight ${done ? "text-gray-800" : "text-gray-300"}`}>
                                                    {isAr ? cfg.labelAr : cfg.labelFr}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Cancelled state */}
                        {isCancelled && (
                            <div className="px-6 py-6 flex items-center gap-3 text-red-600">
                                <XCircle className="w-10 h-10" />
                                <p className="font-bold text-lg">
                                    {isAr ? "تم إلغاء هذه الطلبية. للاستفسار تواصل معنا." : "This order has been cancelled. Contact us for more info."}
                                </p>
                            </div>
                        )}

                        {/* Order details */}
                        <div className="px-6 pb-6 space-y-3 border-t border-gray-100 pt-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">{isAr ? "الاسم" : "Name"}</span>
                                <span className="font-bold text-gray-900">{order.client?.name}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">{isAr ? "المدينة" : "City"}</span>
                                <span className="font-bold text-gray-900">{order.client?.city}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">{isAr ? "المنتجات" : "Items"}</span>
                                <span className="font-bold text-gray-900 text-right max-w-[60%]">{order.items}</span>
                            </div>
                            <div className="flex justify-between text-sm border-t pt-3">
                                <span className="text-gray-500 font-medium">{isAr ? "المجموع" : "Total"}</span>
                                <span className="font-black text-emerald-700 text-lg">{order.total} درهم</span>
                            </div>
                            <p className="text-xs text-gray-400 text-center pt-1">
                                {isAr ? "🔄 يتحدث هذا الصفحة تلقائياً عند تغيير حالة طلبيتك" : "🔄 This page updates automatically when your order status changes"}
                            </p>
                        </div>
                    </div>
                )}

                {/* Empty state (searched, no error, no result yet) */}
                {!loading && !error && !order && !searched && (
                    <div className="text-center py-10 text-gray-400">
                        <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p className="font-medium">{isAr ? "أدخل رقم هاتفك لتتبع طلبيتك" : "Enter your phone number to track your order"}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
