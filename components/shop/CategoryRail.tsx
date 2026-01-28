"use client";

import { useShop } from "@/context/ShopContext";
import { Folder } from "lucide-react";

interface CategoryRailProps {
    onSelect: (category: string) => void;
    selectedCategory: string;
}

export default function CategoryRail({ onSelect, selectedCategory }: CategoryRailProps) {
    const { categories } = useShop();

    if (categories.length === 0) return null;

    return (
        <div className="w-full overflow-x-auto pb-4 pt-2 px-4 scrollbar-hide">
            <div className="flex gap-4 min-w-max mx-auto px-2">

                {/* All Items Option */}
                <div
                    onClick={() => onSelect("All")}
                    className="flex flex-col items-center gap-2 cursor-pointer group"
                >
                    <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all ${selectedCategory === "All" ? "border-emerald-500 bg-emerald-50 scale-105 shadow-md" : "border-gray-200 bg-gray-50 group-hover:border-emerald-200"}`}>
                        <span className={`text-xl font-bold ${selectedCategory === "All" ? "text-emerald-600" : "text-gray-400"}`}>الكل</span>
                    </div>
                </div>

                {/* Dynamic Categories */}
                {categories.map((c) => (
                    <div
                        key={c.id}
                        onClick={() => onSelect(c.name)}
                        className="flex flex-col items-center gap-2 cursor-pointer group"
                    >
                        <div className={`w-16 h-16 rounded-full border-2 overflow-hidden transition-all bg-white flex items-center justify-center ${selectedCategory === c.name ? "border-emerald-500 scale-105 shadow-md" : "border-gray-200 group-hover:border-emerald-400"}`}>
                            <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                        </div>
                        <span className={`text-xs font-bold text-center mt-1 ${selectedCategory === c.name ? "text-emerald-700" : "text-gray-500"}`}>{c.name}</span>
                    </div>
                ))}

            </div>
        </div>
    );
}
