"use client";

import { useState } from "react";
import { useShop } from "@/context/ShopContext";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { getLocalized } from "@/lib/utils";
import { Lock, LogOut, Package, Tag, Palette, Settings, Star, FileText, Truck, ShoppingBag, Menu, X, Users } from "lucide-react";
import { useRouter } from "next/navigation";

// Sub-Components
import AdminCustomers from "@/components/admin/AdminCustomers";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminCategories from "@/components/admin/AdminCategories";
import AdminDesign from "@/components/admin/AdminDesign";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminReviews from "@/components/admin/AdminReviews";
import AdminPages from "@/components/admin/AdminPages";
import AdminShipping from "@/components/admin/AdminShipping";

export default function AdminPage() {
    const { settings } = useShop();
    const t = useTranslations('Admin');
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const router = useRouter();

    // Key State
    const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'customers' | 'design' | 'settings' | 'reviews' | 'pages' | 'shipping'>('products');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [inputPassword, setInputPassword] = useState("");

    // 🔒 1. Login Guard
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-tajawal">
                <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
                    <div className="bg-blue-100 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-6 text-blue-600">
                        <Lock className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">{t('logining')}</h2>
                    <input
                        type="password"
                        placeholder={t('enterCode')}
                        className="w-full p-3 border rounded-lg mb-4 text-center text-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                        value={inputPassword}
                        onChange={(e) => setInputPassword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                const correctPassword = settings?.adminPassword || "123456";
                                if (inputPassword === correctPassword) setIsAuthenticated(true);
                                else toast.error(`❌ ${t('wrongCode')}`);
                            }
                        }}
                    />
                    <button
                        onClick={() => {
                            const correctPassword = settings?.adminPassword || "123456";
                            if (inputPassword === correctPassword) {
                                setIsAuthenticated(true);
                            } else {
                                toast.error(`❌ ${t('wrongCode')}`);
                            }
                        }}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
                    >
                        {t('login')}
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
        { id: 'products', label: t('products'), icon: Package },
        { id: 'categories', label: t('categories'), icon: Tag },
        { id: 'customers', label: t('customers'), icon: Users },
        { id: 'shipping', label: t('shipping'), icon: Truck },
        { id: 'design', label: t('design'), icon: Palette },
        { id: 'reviews', label: t('reviews'), icon: Star },
        { id: 'pages', label: t('pages'), icon: FileText },
        { id: 'settings', label: t('settings'), icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50 font-tajawal relative">

            {/* MOBILE: Header (Hamburger) - Visible only on mobile */}
            <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b z-50 px-4 py-3 flex items-center justify-between shadow-sm">
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-700"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2">
                    <h1 className="text-lg font-black text-emerald-800">{t('dashboard')}</h1>
                </div>
                <button onClick={handleLogout} className="p-2 text-red-600">
                    <LogOut className="w-5 h-5" />
                </button>
            </header>

            {/* MOBILE: Backdrop Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-[55] backdrop-blur-sm md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* SIDEBAR - Responsive Logic 
                Mobile: Fixed off-canvas (z-60)
                Desktop: Sticky in-flow (z-10), flex item
            */}
            <aside className={`
                fixed inset-y-0 start-0 z-[60] flex flex-col w-64 bg-white shadow-xl border-e
                transition-transform duration-300 ease-in-out shrink-0
                
                /* Mobile Transformation Logic */
                ${isMobileMenuOpen ? 'translate-x-0' : (isRtl ? 'translate-x-full' : '-translate-x-full')}
                
                /* Desktop: Reset to Relative/Sticky + Visible */
                md:translate-x-0 md:sticky md:top-0 md:h-screen md:shadow-none md:z-10
            `}>
                {/* Close button - Mobile only */}
                <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="md:hidden absolute top-4 end-4 p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Logo/Brand */}
                <div className="p-6 border-b shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-100 p-2 rounded-xl text-emerald-700">
                            <Settings className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-gray-900">{t('dashboard')}</h1>
                            <p className="text-xs text-gray-500">
                                {getLocalized(settings.storeName, locale)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu (Scrollable) */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
                    <div className="space-y-1">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id as any);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${isActive
                                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-emerald-700"
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </nav>

                {/* Logout Button (Fixed at bottom of sidebar) */}
                <div className="p-4 border-t bg-gray-50/50 shrink-0">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition font-bold text-sm"
                    >
                        <LogOut className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
                        <span>{t('logout')}</span>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA 
                Flex-1: Takes remaining width
                Min-w-0: Prevents flex overflow issues
                Padding: Large safe areas for mobile (Header blocking top, safe area bottom)
            */}
            <main className="flex-1 min-w-0 p-4 md:p-8 pt-24 md:pt-8 pb-24 md:pb-8 transition-all">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Content */}
                    <div className="animate-in fade-in zoom-in-95 duration-500">
                        {activeTab === 'products' && <AdminProducts />}
                        {activeTab === 'categories' && <AdminCategories />}
                        {activeTab === 'customers' && <AdminCustomers />}
                        {activeTab === 'shipping' && <AdminShipping />}
                        {activeTab === 'design' && <AdminDesign />}
                        {activeTab === 'reviews' && <AdminReviews />}
                        {activeTab === 'pages' && <AdminPages />}
                        {activeTab === 'settings' && <AdminSettings />}
                    </div>
                </div>
            </main>
        </div>
    );
}
