"use client";

import { ShoppingBag } from "lucide-react";

interface Product {
    id: string;
    title: string;
    price: string;
    image: string;
    category: string;
}

interface SiteSettings {
    storeName: string;
    telegramId: string;
    sheetUrl: string;
}

interface PhonePreviewProps {
    settings: SiteSettings;
    products: Product[];
}

export default function PhonePreview({ settings, products }: PhonePreviewProps) {
    return (
        <div className="w-[375px] h-[750px] bg-white rounded-[3rem] border-[8px] border-gray-900 shadow-2xl overflow-hidden relative flex flex-col">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-20"></div>

            {/* App Header */}
            <header className="pt-12 pb-4 px-4 bg-white sticky top-0 z-10 border-b flex justify-between items-center">
                <div className="font-black text-xl truncate max-w-[200px]">{settings.storeName}</div>
                <div className="relative">
                    <ShoppingBag className="w-6 h-6 text-gray-700" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">0</span>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-y-auto p-4 bg-gray-50 no-scrollbar">
                {/* Banner Placeholder */}
                <div className="h-40 bg-gradient-to-tr from-emerald-500 to-emerald-300 rounded-2xl mb-6 flex items-center justify-center text-white font-bold shadow-lg">
                    Banner Area
                </div>

                {/* Categories */}
                <div className="flex gap-3 overflow-x-auto pb-4">
                    {["All", "New", "Sale"].map(c => (
                        <div key={c} className="px-4 py-2 bg-white rounded-full border text-xs font-bold whitespace-nowrap shadow-sm">
                            {c}
                        </div>
                    ))}
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 gap-3 pb-8">
                    {products.length === 0 && (
                        <div className="col-span-2 text-center py-10 text-gray-400 text-sm">
                            No products yet. Add some!
                        </div>
                    )}
                    {products.map(p => (
                        <div key={p.id} className="bg-white p-2 rounded-xl border shadow-sm">
                            <div className="aspect-square bg-gray-100 rounded-lg mb-2 overflow-hidden">
                                <img src={p.image} className="w-full h-full object-cover" />
                            </div>
                            <div className="font-bold text-sm truncate">{p.title}</div>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-emerald-600 font-bold text-sm">{p.price} DH</span>
                                <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center shadow-md">+</div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Bottom Nav (Optional) */}
            <div className="h-1 bg-gray-900 w-1/3 mx-auto rounded-full mb-2"></div>
        </div>
    );
}
