"use client";

import { useShop } from "@/context/ShopContext";
import { Search } from "lucide-react";

export default function SearchBar() {
    const { searchQuery, setSearchQuery } = useShop();

    return (
        <div className="relative w-full shadow-sm rounded-full bg-white border border-gray-100 group focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-all">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-4 py-3 rounded-full text-gray-900 placeholder-gray-400 bg-transparent outline-none text-sm font-medium"
                placeholder="ابحث عن منتج..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
    );
}
