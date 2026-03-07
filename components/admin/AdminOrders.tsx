"use client";

import { useState } from "react";
import { useShop, Order } from "@/context/ShopContext";
import { useTranslations, useLocale } from "next-intl";
import { Search, Package, Clock, User, Phone, MapPin, Star, ChevronDown } from "lucide-react";
import { toast } from "sonner";

const ORDER_STATUSES = [
    { value: "pending", labelEn: "Pending", color: "bg-yellow-100 text-yellow-800" },
    { value: "confirmed", labelEn: "Confirmed", color: "bg-blue-100 text-blue-800" },
    { value: "shipped", labelEn: "Shipped / With Delivery", color: "bg-purple-100 text-purple-800" },
    { value: "delivered", labelEn: "Delivered", color: "bg-green-100 text-green-800" },
    { value: "cancelled", labelEn: "Cancelled", color: "bg-red-100 text-red-800" },
] as const;

function StatusBadge({ status }: { status: string }) {
    const cfg = ORDER_STATUSES.find(s => s.value === status) ?? ORDER_STATUSES[0];
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${cfg.color}`}>
            {cfg.labelEn}
        </span>
    );
}

function StatusDropdown({ order, onUpdate }: { order: Order; onUpdate: (id: string, status: string) => void }) {
    const [updating, setUpdating] = useState(false);

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        setUpdating(true);
        try {
            const res = await fetch("/api/update-order-status", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: order.id,
                    status: newStatus,
                    storeName: order.storeName,
                }),
            });
            if (res.ok) {
                onUpdate(order.id, newStatus);
                toast.success(`Status updated → ${newStatus}`);
            } else {
                toast.error("Failed to update status");
            }
        } catch {
            toast.error("Network error");
        } finally {
            setUpdating(false);
        }
    };

    const cfg = ORDER_STATUSES.find(s => s.value === (order.status ?? "pending")) ?? ORDER_STATUSES[0];

    return (
        <div className="relative inline-flex items-center">
            <select
                value={order.status ?? "pending"}
                onChange={handleChange}
                disabled={updating}
                className={`appearance-none pr-7 pl-3 py-1 rounded-full text-xs font-bold border-0 outline-none cursor-pointer transition ${cfg.color} ${updating ? "opacity-50 cursor-wait" : ""}`}
            >
                {ORDER_STATUSES.map(s => (
                    <option key={s.value} value={s.value}>{s.labelEn}</option>
                ))}
            </select>
            <ChevronDown className="w-3 h-3 absolute right-2 pointer-events-none text-current opacity-60" />
        </div>
    );
}

export default function AdminOrders() {
    const { orders } = useShop();
    const t = useTranslations("Admin");
    const locale = useLocale();

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    // Optimistic local overrides: { [orderId]: status }
    const [localStatus, setLocalStatus] = useState<Record<string, string>>({});

    const customerFrequency = orders.reduce((acc: Record<string, number>, order: Order) => {
        const phone = order.client?.phone || "unknown";
        acc[phone] = (acc[phone] || 0) + 1;
        return acc;
    }, {});

    // Merge RTDB orders with local overrides
    const ordersWithOverrides = orders.map((o: Order) => ({
        ...o,
        status: localStatus[o.id] ?? o.status,
    }));

    const filteredOrders = ordersWithOverrides
        .filter(order => {
            const matchesSearch =
                (order.client?.name || "").toLowerCase().includes(search.toLowerCase()) ||
                (order.client?.phone || "").includes(search) ||
                (order.id || "").toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === "all" || (order.status ?? "pending") === statusFilter;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Optimistic status update — reflects immediately without waiting for RTDB sync
    const handleStatusUpdate = (orderId: string, newStatus: string) => {
        setLocalStatus(prev => ({ ...prev, [orderId]: newStatus }));
    };

    return (
        <div className="space-y-6">
            {/* Header / Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder={t("searchOrders") || "Search Orders..."}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="p-2 border rounded-lg bg-gray-50 outline-none w-full md:w-auto"
                >
                    <option value="all">{t("allOrders") || "All Orders"}</option>
                    {ORDER_STATUSES.map(s => (
                        <option key={s.value} value={s.value}>{s.labelEn}</option>
                    ))}
                </select>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600 w-16">#</th>
                                <th className="p-4 font-semibold text-gray-600">{t("date") || "Date"}</th>
                                <th className="p-4 font-semibold text-gray-600">{t("customer") || "Customer"}</th>
                                <th className="p-4 font-semibold text-gray-600 max-w-xs">{t("items") || "Items"}</th>
                                <th className="p-4 font-semibold text-gray-600 text-right">{t("total") || "Total"}</th>
                                <th className="p-4 font-semibold text-gray-600 text-center">{t("status") || "Status"}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredOrders.map((order, idx) => {
                                const isReturning = (customerFrequency[order.client?.phone] || 0) > 1;
                                return (
                                    <tr key={order.id} className="hover:bg-gray-50 transition group">
                                        <td className="p-4 text-xs text-gray-400 font-mono">{orders.length - idx}</td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-gray-700">
                                                    {new Date(order.createdAt).toLocaleDateString(locale)}
                                                </span>
                                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(order.createdAt).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="bg-emerald-100 p-2 rounded-full text-emerald-700 mt-1">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 flex items-center gap-2">
                                                        {order.client?.name}
                                                        {isReturning && (
                                                            <span className="bg-yellow-100 text-yellow-700 text-[10px] px-1.5 py-0.5 rounded-full border border-yellow-200 flex items-center gap-1 animate-pulse">
                                                                <Star className="w-3 h-3 fill-yellow-500" />
                                                                {t("returning") || "Returning"}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                                                        <Phone className="w-3 h-3" />
                                                        <a href={`https://wa.me/${order.client?.phone}`} target="_blank" className="hover:underline decoration-emerald-500 hover:text-emerald-600">
                                                            {order.client?.phone}
                                                        </a>
                                                    </div>
                                                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                                        <MapPin className="w-3 h-3" />
                                                        {order.client?.city}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 max-w-xs text-sm text-gray-600 leading-relaxed">{order.items}</td>
                                        <td className="p-4 text-right">
                                            <span className="font-mono font-bold text-emerald-700 text-lg">
                                                {order.total?.toLocaleString()} MAD
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <StatusDropdown order={order} onUpdate={handleStatusUpdate} />
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-gray-400">
                                        <Package className="w-12 h-12 mb-3 opacity-20 mx-auto" />
                                        <p>{t("noOrdersFound") || "No orders found."}</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
