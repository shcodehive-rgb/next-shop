"use client";

import { useState } from "react";
import { useShop } from "@/context/ShopContext";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Tag, SlidersHorizontal, RotateCcw } from "lucide-react";

const MAX_PRICE = 3000;

export default function ShopSidebar() {
    const { categories, priceFilter, setPriceFilter } = useShop();
    const locale = useLocale();
    const router = useRouter();

    const [localMin, setLocalMin] = useState(String(priceFilter?.min ?? 0));
    const [localMax, setLocalMax] = useState(String(priceFilter?.max ?? MAX_PRICE));

    const isRTL = locale === "ar";

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setLocalMin(v);
        setPriceFilter({ ...priceFilter, min: parseInt(v) || 0 });
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setLocalMax(v);
        setPriceFilter({ ...priceFilter, max: parseInt(v) || MAX_PRICE });
    };

    const resetPrice = () => {
        setLocalMin("0");
        setLocalMax(String(MAX_PRICE));
        setPriceFilter({ min: 0, max: MAX_PRICE });
    };

    const hasActiveFilter =
        (priceFilter?.min ?? 0) > 0 ||
        (priceFilter?.max ?? MAX_PRICE) < MAX_PRICE;

    const getCatName = (name: any) => {
        if (typeof name === "string") return name;
        return name?.[locale] || name?.ar || name?.en || "";
    };

    // Price preset chips
    const presets = [
        { label: locale === "ar" ? "أقل من 100" : "Under 100", min: 0, max: 99 },
        { label: "100 – 200", min: 100, max: 200 },
        { label: "200 – 500", min: 200, max: 500 },
        { label: "500 – 1000", min: 500, max: 1000 },
        { label: locale === "ar" ? "+1000" : "1000+", min: 1000, max: MAX_PRICE },
    ];

    const applyPreset = (min: number, max: number) => {
        setLocalMin(String(min));
        setLocalMax(String(max));
        setPriceFilter({ min, max });
    };

    return (
        <aside className="space-y-4 sticky top-4">

            {/* ── CATEGORIES ───────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <h2 className="font-black text-gray-800 text-sm">
                        {locale === "ar" ? "الفئات" : "Categories"}
                    </h2>
                </div>
                <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                    {/* All */}
                    <button
                        onClick={() => router.push(`/${locale}/products`)}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
                    >
                        <span>{locale === "ar" ? "جميع المنتجات" : "All Products"}</span>
                        <span className="text-xs bg-emerald-100 px-2 py-0.5 rounded-full text-emerald-700">
                            ✓
                        </span>
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => router.push(`/${locale}/collection/${cat.id}`)}
                            className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-emerald-700 transition text-right"
                        >
                            <span>{getCatName(cat.name)}</span>
                            <span className="text-gray-300 text-xs rtl:rotate-180">›</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── PRICE FILTER ─────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                        <h2 className="font-black text-gray-800 text-sm">
                            {locale === "ar" ? "فلترة الأسعار" : "Price Filter"}
                        </h2>
                    </div>
                    {hasActiveFilter && (
                        <button
                            onClick={resetPrice}
                            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-bold transition"
                        >
                            <RotateCcw className="w-3 h-3" />
                            {locale === "ar" ? "إعادة" : "Reset"}
                        </button>
                    )}
                </div>

                <div className="p-4 space-y-4">
                    {/* Quick preset chips */}
                    <div className="flex flex-wrap gap-1.5">
                        {presets.map((p) => {
                            const active =
                                priceFilter?.min === p.min && priceFilter?.max === p.max;
                            return (
                                <button
                                    key={p.label}
                                    onClick={() => applyPreset(p.min, p.max)}
                                    className={`text-xs px-2.5 py-1 rounded-full font-bold border transition ${active
                                            ? "bg-emerald-600 text-white border-emerald-600"
                                            : "bg-gray-50 text-gray-600 border-gray-200 hover:border-emerald-400 hover:text-emerald-700"
                                        }`}
                                >
                                    {p.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Min / Max inputs */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                                {locale === "ar" ? "الحد الأدنى" : "Min"}
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={localMin}
                                    onChange={handleMinChange}
                                    min={0}
                                    max={MAX_PRICE}
                                    className="w-full border border-gray-200 rounded-lg py-2 pl-2 pr-7 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold">
                                    DH
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                                {locale === "ar" ? "الحد الأقصى" : "Max"}
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={localMax}
                                    onChange={handleMaxChange}
                                    min={0}
                                    max={MAX_PRICE}
                                    className="w-full border border-gray-200 rounded-lg py-2 pl-2 pr-7 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold">
                                    DH
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Active filter badge */}
                    {hasActiveFilter && (
                        <div className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2 font-bold border border-emerald-100">
                            {locale === "ar"
                                ? `الأسعار: ${priceFilter.min} – ${priceFilter.max} DH`
                                : `Price: ${priceFilter.min} – ${priceFilter.max} DH`}
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
