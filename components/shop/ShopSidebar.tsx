"use client";

import { useState } from "react";
import { useShop } from "@/context/ShopContext";
import { useLocale } from "next-intl";
import { useRouter, usePathname, useParams } from "next/navigation";
import { Tag, SlidersHorizontal, RotateCcw, SlidersVertical, X, Check, Filter, ChevronDown } from "lucide-react";

const MAX_PRICE = 3000;

// ─── Inner panels (shared between sidebar & drawer) ──────────────────────────

function CategoryPanel({ onSelect }: { onSelect?: () => void }) {
    const { categories } = useShop();
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const currentSlug = params.slug as string;

    const getCatName = (name: any) =>
        typeof name === "string" ? name : name?.[locale] || name?.ar || name?.en || "";

    const go = (path: string) => {
        onSelect?.();
        router.push(path);
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <Tag className="w-4 h-4 text-emerald-600" />
                <h2 className="font-black text-gray-800 text-sm">
                    {locale === "ar" ? "الفئات" : "Categories"}
                </h2>
            </div>
            <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                <button
                    onClick={() => go(`/${locale}/collections/all`)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-bold transition ${pathname.includes('/collections/all')
                        ? "text-emerald-700 bg-emerald-50 border-r-4 border-emerald-600"
                        : "text-gray-700 hover:bg-gray-50 hover:text-emerald-700"
                        }`}
                >
                    <span>{locale === "ar" ? "جميع المنتجات" : "All Products"}</span>
                    {pathname.includes('/collections/all') && <Check className="w-3 h-3 text-emerald-600" />}
                </button>
                {categories
                    .filter(cat => {
                        const catName = typeof cat.name === 'string' ? cat.name.toLowerCase() :
                            ((cat.name as any)?.[locale]?.toLowerCase() || (cat.name as any)?.en?.toLowerCase() || (cat.name as any)?.ar?.toLowerCase() || '');
                        return ['arts-martiaux', 'gear-accessories', 'packs-individuels', 'packs-clubs', 'equipements', 'packs-offres'].includes(catName);
                    })
                    .map((cat) => {
                        const isActive = currentSlug === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => go(`/${locale}/collections/${cat.id}`)}
                                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition ${isActive
                                    ? "text-emerald-700 bg-emerald-50 border-r-4 border-emerald-600"
                                    : "text-gray-700 hover:bg-gray-50 hover:text-emerald-700"
                                    } text-right`}
                            >
                                <span>{getCatName(cat.name)}</span>
                                {isActive ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="text-gray-300 text-xs">›</span>}
                            </button>
                        );
                    })}
            </div>
        </div>
    );
}

function PricePanel() {
    const { priceFilter, setPriceFilter } = useShop();
    const locale = useLocale();

    const [localMin, setLocalMin] = useState(String(priceFilter?.min ?? 0));
    const [localMax, setLocalMax] = useState(String(priceFilter?.max ?? MAX_PRICE));

    const handleMin = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalMin(e.target.value);
        setPriceFilter({ ...priceFilter, min: parseInt(e.target.value) || 0 });
    };
    const handleMax = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalMax(e.target.value);
        setPriceFilter({ ...priceFilter, max: parseInt(e.target.value) || MAX_PRICE });
    };
    const reset = () => {
        setLocalMin("0");
        setLocalMax(String(MAX_PRICE));
        setPriceFilter({ min: 0, max: MAX_PRICE });
    };

    const hasActive = (priceFilter?.min ?? 0) > 0 || (priceFilter?.max ?? MAX_PRICE) < MAX_PRICE;

    const presets = [
        { label: locale === "ar" ? "أقل من 100" : "< 100", min: 0, max: 99 },
        { label: "100 – 200", min: 100, max: 200 },
        { label: "200 – 500", min: 200, max: 500 },
        { label: "500 – 1000", min: 500, max: 1000 },
        { label: "+1000", min: 1000, max: MAX_PRICE },
    ];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                    <h2 className="font-black text-gray-800 text-sm">
                        {locale === "ar" ? "فلترة الأسعار" : "Price Filter"}
                    </h2>
                </div>
                {hasActive && (
                    <button onClick={reset} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors font-bold uppercase tracking-wider">
                        <RotateCcw className="w-3 h-3" />
                        {locale === "ar" ? "إعادة" : "Reset"}
                    </button>
                )}
            </div>
            <div className="p-4 space-y-4">
                {/* Preset chips */}
                <div className="flex flex-wrap gap-1.5">
                    {presets.map((p) => {
                        const active = priceFilter?.min === p.min && priceFilter?.max === p.max;
                        return (
                            <button
                                key={p.label}
                                onClick={() => {
                                    setLocalMin(String(p.min));
                                    setLocalMax(String(p.max));
                                    setPriceFilter({ min: p.min, max: p.max });
                                }}
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
                {/* Min / Max */}
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { label: locale === "ar" ? "الحد الأدنى" : "Min", val: localMin, fn: handleMin },
                        { label: locale === "ar" ? "الحد الأقصى" : "Max", val: localMax, fn: handleMax },
                    ].map(({ label, val, fn }) => (
                        <div key={label}>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{label}</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={val}
                                    onChange={fn}
                                    min={0}
                                    max={MAX_PRICE}
                                    className="w-full border border-gray-200 rounded-lg py-2 pl-2 pr-7 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold">DH</span>
                            </div>
                        </div>
                    ))}
                </div>
                {hasActive && (
                    <div className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2 font-bold border border-emerald-100">
                        {locale === "ar"
                            ? `${priceFilter.min} – ${priceFilter.max} DH`
                            : `${priceFilter.min} – ${priceFilter.max} DH`}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main ShopSidebar ─────────────────────────────────────────────────────────

export default function ShopSidebar() {
    const locale = useLocale();
    const [isOpen, setIsOpen] = useState(false);
    const { priceFilter } = useShop();

    const hasActiveFilter =
        (priceFilter?.min ?? 0) > 0 || (priceFilter?.max ?? MAX_PRICE) < MAX_PRICE;

    return (
        <>
            {/* ── MOBILE: Dropdown Filter Toggle ──────────────── */}
            <div className="lg:hidden flex flex-col mb-4 w-full">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex lg:!hidden w-full items-center justify-between border border-gray-300 p-3 mb-6 bg-white font-bold rounded-lg shadow-sm"
                >
                    <span className="font-bold text-gray-900">
                        {locale === "ar" ? "تصفية حسب الفئة" : "Catégories"}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Collapsible Content */}
                <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[1000px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="flex flex-col gap-4">
                        <CategoryPanel onSelect={() => setIsOpen(false)} />
                        <PricePanel />
                    </div>
                </div>
            </div>

            {/* ── DESKTOP: Sticky Sidebar ───────────────── */}
            <aside className="hidden lg:flex flex-col gap-4 sticky top-4">
                <CategoryPanel />
                <PricePanel />
            </aside>
        </>
    );
}
