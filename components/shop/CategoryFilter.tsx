"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Filter, X, Check } from "lucide-react";
import { Category } from "@/context/ShopContext";

interface CategoryFilterProps {
    categories: Category[];
    currentCategoryId?: string;
}

export default function CategoryFilter({ categories, currentCategoryId }: CategoryFilterProps) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;

    const handleCategorySelect = (categoryId: string) => {
        setIsFilterOpen(false);
        if (categoryId === 'all') {
            router.push(`/${locale}/products`); // Assuming a global products page or back to home if preferred, user asked for "Products" page.
        } else {
            router.push(`/${locale}/collection/${categoryId}`);
        }
    };

    return (
        <>
            {/* Filter Button */}
            <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-xl font-bold transition-all shadow-sm"
            >
                <Filter className="w-5 h-5 text-emerald-600" />
                <span>تصفية</span>
            </button>

            {/* Filter Drawer / Modal */}
            {isFilterOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
                    {/* Backdrop Click to Close */}
                    <div className="absolute inset-0" onClick={() => setIsFilterOpen(false)} />

                    <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 mx-4">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-gray-900">تصفية المنتجات</h3>
                            <button
                                onClick={() => setIsFilterOpen(false)}
                                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                            {/* 'All' Option - Navigates to Global Products Page */}
                            <button
                                onClick={() => handleCategorySelect('all')}
                                className={`w-full flex items-center justify-between p-4 rounded-xl font-bold transition-all ${!currentCategoryId
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <span>الكل</span>
                                {!currentCategoryId && <div className="w-3 h-3 bg-emerald-500 rounded-full" />}
                            </button>

                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategorySelect(cat.id)}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl font-bold transition-all ${currentCategoryId === cat.id
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <span>{typeof cat.name === 'string' ? cat.name : (cat.name as any)['ar'] || (cat.name as any)['en']}</span>
                                    {currentCategoryId === cat.id && <div className="w-3 h-3 bg-emerald-500 rounded-full" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
