"use client";

import { useState } from "react";
import { useShop } from "@/context/ShopContext";
import { useTranslations } from "next-intl";
import { Search, Filter, ArrowUpDown, MessageCircle, ShoppingBag, Coins } from "lucide-react";
import { getLocalized } from "@/lib/utils";

export default function AdminCustomers() {
    const { customers } = useShop();
    const t = useTranslations('Admin');

    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState<'totalSpent' | 'ordersCount' | 'lastOrder'>('totalSpent');
    const [filterInterest, setFilterInterest] = useState<string>("");

    // 1. Process Data
    const filteredCustomers = customers.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.phone.includes(search);
        const matchesInterest = filterInterest ? c.interests?.includes(filterInterest) : true;
        return matchesSearch && matchesInterest;
    }).sort((a, b) => {
        if (sortBy === 'totalSpent') return b.totalSpent - a.totalSpent;
        if (sortBy === 'ordersCount') return b.ordersCount - a.ordersCount;
        return new Date(b.lastOrder).getTime() - new Date(a.lastOrder).getTime();
    });

    // Unique Interests for Filter
    const allInterests = Array.from(new Set(customers.flatMap(c => c.interests || [])));

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border">
                {/* Search */}
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder={t('searchCustomers')} // Ensure 'searchCustomers' key exists or use fallback
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Filters & Sort */}
                <div className="flex gap-2 w-full md:w-auto">
                    <select
                        className="p-2 border rounded-lg bg-gray-50 outline-none"
                        value={filterInterest}
                        onChange={(e) => setFilterInterest(e.target.value)}
                    >
                        <option value="">{t('allInterests')}</option>
                        {allInterests.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>

                    <div className="flex rounded-lg border bg-gray-50 p-1">
                        <button
                            onClick={() => setSortBy('totalSpent')}
                            className={`p-2 rounded-md transition ${sortBy === 'totalSpent' ? 'bg-white shadow text-emerald-600' : 'text-gray-500'}`}
                            title={t('sortBySpent')}
                        >
                            <Coins className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setSortBy('ordersCount')}
                            className={`p-2 rounded-md transition ${sortBy === 'ordersCount' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                            title={t('sortByOrders')}
                        >
                            <ShoppingBag className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">{t('customer')}</th>
                            <th className="p-4 font-semibold text-gray-600">{t('phone')}</th>
                            <th className="p-4 font-semibold text-gray-600">{t('city')}</th>
                            <th className="p-4 font-semibold text-gray-600 hidden md:table-cell">{t('interests')}</th>
                            <th className="p-4 font-semibold text-gray-600 text-center">{t('orders')}</th>
                            <th className="p-4 font-semibold text-gray-600 text-right">{t('totalSpent')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredCustomers.map(customer => (
                            <tr key={customer.id} className="hover:bg-gray-50 transition">
                                <td className="p-4">
                                    <div className="font-bold text-gray-900">{getLocalized(customer.name)}</div>
                                    <div className="text-xs text-gray-400">ID: {customer.id}</div>
                                </td>
                                <td className="p-4">
                                    <a
                                        href={`https://wa.me/${customer.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-emerald-600 hover:underline bg-emerald-50 px-2 py-1 rounded w-fit"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        <span className="font-mono text-sm">{customer.phone}</span>
                                    </a>
                                </td>
                                <td className="p-4 text-gray-600">{customer.city}</td>
                                <td className="p-4 hidden md:table-cell">
                                    <div className="flex flex-wrap gap-1">
                                        {customer.interests?.slice(0, 3).map(interest => (
                                            <span key={interest} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs border border-blue-100">
                                                {interest}
                                            </span>
                                        ))}
                                        {(customer.interests?.length || 0) > 3 && (
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                                                +{customer.interests.length - 3}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <span className="inline-flex items-center justify-center min-w-[2rem] h-6 bg-gray-100 rounded-full text-sm font-medium">
                                        {customer.ordersCount}
                                    </span>
                                </td>
                                <td className="p-4 text-right font-mono font-bold text-emerald-700">
                                    {customer.totalSpent?.toLocaleString()} MAD
                                </td>
                            </tr>
                        ))}

                        {filteredCustomers.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-400">
                                    {t('noCustomersFound')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
