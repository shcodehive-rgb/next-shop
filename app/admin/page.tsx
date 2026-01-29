"use client";

import { useState } from "react";
import { useShop } from "@/context/ShopContext";
import { toast } from "sonner";
import { Lock, LogOut, Package, Tag, Palette, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

// Sub-Components
import AdminProducts from "@/components/admin/AdminProducts";
import AdminCategories from "@/components/admin/AdminCategories";
import AdminDesign from "@/components/admin/AdminDesign";
import AdminSettings from "@/components/admin/AdminSettings";

export default function AdminPage() {
    const { settings } = useShop();
    const router = useRouter();

    // Key State
    const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'design' | 'settings'>('products');

    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [inputPassword, setInputPassword] = useState("");

    // 🔒 1. Login Guard
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-tajawal" dir="rtl">
                <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
                    <div className="bg-blue-100 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-6 text-blue-600">
                        <Lock className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">🔒 الدخول إلى لوحة التحكم</h2>
                    <input
                        type="password"
                        placeholder="أدخل القن السري (Code Admin)"
                        className="w-full p-3 border rounded-lg mb-4 text-center text-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                        value={inputPassword}
                        onChange={(e) => setInputPassword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                const correctPassword = settings?.adminPassword || "123456";
                                if (inputPassword === correctPassword) setIsAuthenticated(true);
                                else toast.error("❌ الكود غالط!");
                            }
                        }}
                    />
                    <button
                        onClick={() => {
                            const correctPassword = settings?.adminPassword || "123456";
                            if (inputPassword === correctPassword) {
                                setIsAuthenticated(true);
                            } else {
                                toast.error("❌ الكود غالط!");
                            }
                        }}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
                    >
                        دخول (Login)
                    </button>
                    <p className="mt-4 text-sm text-gray-400">Default Code: 123456</p>
                </div>
            </div>
        );
    }

    // --- ACTIONS ---
    const handleLogout = () => router.push("/");

    // --- TABS CONFIG ---
    const tabs = [
        { id: 'products', label: 'المنتجات', icon: Package },
        { id: 'categories', label: 'التصنيفات', icon: Tag },
        { id: 'design', label: 'التصميم', icon: Palette },
        { id: 'settings', label: 'الإعدادات', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-tajawal pb-20" dir="rtl">
            {/* HEADER */}
            <header className="bg-white border-b sticky top-0 z-30 px-4 md:px-6 py-4 shadow-sm flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700">
                        <Settings className="w-6 h-6" />
                    </div>
                    <h1 className="text-xl font-black text-gray-900 hidden md:block">لوحة التحكم</h1>
                </div>

                {/* Mobile/Desktop Tab Navigation (In Header for cleaner look on mobile?) 
                    Actually, let's put it below header or IN header if space permits.
                    For mobile, a scrollable horizontal list below header is best.
                */}

                <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition font-bold text-sm">
                    <LogOut className="w-4 h-4" /> الخروج
                </button>
            </header>

            {/* TAB NAVIGATION BAR */}
            <div className="sticky top-[73px] z-20 bg-gray-50/95 backdrop-blur border-b px-4 md:px-6 py-2 overflow-x-auto">
                <div className="flex gap-2 min-w-max">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${isActive
                                        ? "bg-emerald-600 text-white shadow-md scale-105"
                                        : "bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 border border-transparent hover:border-emerald-200"
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-4 md:px-6 py-8">
                {activeTab === 'products' && <AdminProducts />}
                {activeTab === 'categories' && <AdminCategories />}
                {activeTab === 'design' && <AdminDesign />}
                {activeTab === 'settings' && <AdminSettings />}
            </main>
        </div>
    );
}
