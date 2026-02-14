"use client";

import { useState, useEffect } from "react";
import { useShop } from "@/context/ShopContext";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getLocalized } from "@/lib/utils";
import { Lock, Smartphone, Globe, ToggleLeft, ToggleRight } from "lucide-react";

export default function AdminSettings() {
    const { settings, updateSettings, isStoreActive } = useShop();
    const t = useTranslations('Admin');
    const [localSettings, setLocalSettings] = useState(settings);

    useEffect(() => {
        if (settings) {
            setLocalSettings(prev => ({ ...prev, ...settings }));
        }
    }, [settings]);

    const handleSaveSettings = async () => {
        try {
            await updateSettings(localSettings);
            toast.success(t('saved'));

            // Only reload if language changed (to apply dir/lang attributes)
            if (localSettings.default_locale !== settings.default_locale) {
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        } catch (e) {
            console.error(e);
            toast.error(t('error_generic'));
        }
    };

    const handleChange = (field: string, value: any) => {
        setLocalSettings(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    ⚙️ {t('storeSettings')}
                </h3>

                <div className="space-y-4">
                    {/* Store Info */}
                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-1">{t('storeName')}</label>
                        <div className="relative">
                            <Globe className="absolute top-3 text-gray-400 w-5 h-5 ltr:right-3 rtl:left-3" />
                            <input
                                value={getLocalized(localSettings.storeName)}
                                onChange={(e) => handleChange("storeName", e.target.value)}
                                className="w-full p-3 bg-gray-50 border rounded-xl font-bold ltr:pr-10 rtl:pl-10"
                                placeholder="My Awesome Shop"
                            />
                        </div>
                    </div>

                    {/* Default Language */}
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                        <label className="block text-sm font-bold text-emerald-800 mb-1">{t('defaultLang')}</label>
                        <select
                            value={localSettings.default_locale || "ar"}
                            onChange={(e) => handleChange("default_locale", e.target.value)}
                            className="w-full p-3 bg-white border border-emerald-200 rounded-xl font-bold text-emerald-900"
                        >
                            <option value="ar">العربية (Arabic)</option>
                            <option value="en">English (الإنجليزية)</option>
                            <option value="fr">Français (الفرنسية)</option>
                        </select>
                        <p className="text-xs text-emerald-600 mt-1">{t('defaultLangDesc')}</p>
                    </div>

                    {/* Announcements */}
                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-1">{t('announcements')}</label>
                        <textarea
                            value={Array.isArray(localSettings.announcements) ? localSettings.announcements.join('\n') : (localSettings.announcements || "")}
                            onChange={(e) => handleChange("announcements", e.target.value.split('\n'))}
                            className="w-full p-3 bg-gray-50 border rounded-xl h-24 font-mono text-sm"
                            placeholder="Promo 1&#10;Promo 2"
                        />
                        <p className="text-xs text-gray-400 mt-1">{t('announcementsDesc')}</p>
                    </div>

                    {/* Contact */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">{t('contactInfo')} (WhatsApp)</label>
                            <div className="relative">
                                <Smartphone className="absolute top-3 text-gray-400 w-5 h-5 ltr:right-3 rtl:left-3" />
                                <input
                                    value={localSettings.phoneNumber || ""}
                                    onChange={(e) => handleChange("phoneNumber", e.target.value)}
                                    className="w-full p-3 bg-gray-50 border rounded-xl font-mono text-sm ltr:pr-10 rtl:pl-10"
                                    placeholder="2126XXXXXXXX"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">Telegram ID</label>
                            <input
                                value={localSettings.telegramId || ""}
                                onChange={(e) => handleChange("telegramId", e.target.value)}
                                className="w-full p-3 bg-gray-50 border rounded-xl font-mono text-sm"
                                placeholder="ex: 12345678"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-500 mb-1">Telegram Bot Token</label>
                            <input
                                value={localSettings.telegramBotToken || ""}
                                onChange={(e) => handleChange("telegramBotToken", e.target.value)}
                                className="w-full p-3 bg-gray-50 border rounded-xl font-mono text-sm border-emerald-200"
                            />
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Admin Access */}
                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-1">{t('adminPass')}</label>
                        <div className="relative">
                            <Lock className="absolute top-3 text-gray-400 w-5 h-5 ltr:right-3 rtl:left-3" />
                            <input
                                value={localSettings.adminPassword || "123456"}
                                onChange={(e) => handleChange("adminPassword", e.target.value)}
                                className="w-full p-3 bg-gray-50 border rounded-xl font-mono text-sm ltr:pr-10 rtl:pl-10"
                                type="text"
                            />
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Tracking & Pixels */}
                    <div>
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            📊 Tracking & Pixels
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-1">TikTok Pixel ID</label>
                                <input
                                    value={localSettings.tiktokPixelId || ""}
                                    onChange={(e) => handleChange("tiktokPixelId", e.target.value)}
                                    className="w-full p-3 bg-gray-50 border rounded-xl font-mono text-sm"
                                    placeholder="Examples: C34k..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-blue-600 mb-1">Facebook Pixel (Main)</label>
                                <input
                                    value={localSettings.facebookPixelId || ""}
                                    onChange={(e) => handleChange("facebookPixelId", e.target.value)}
                                    className="w-full p-3 bg-blue-50 border border-blue-100 rounded-xl font-mono text-sm text-blue-800"
                                    placeholder="EX: 123456789"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-1">FB Pixel (Backup 1)</label>
                                <input
                                    value={localSettings.facebookPixelBackup1 || ""}
                                    onChange={(e) => handleChange("facebookPixelBackup1", e.target.value)}
                                    className="w-full p-3 bg-gray-50 border rounded-xl font-mono text-sm"
                                    placeholder="Optional"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-1">FB Pixel (Backup 2)</label>
                                <input
                                    value={localSettings.facebookPixelBackup2 || ""}
                                    onChange={(e) => handleChange("facebookPixelBackup2", e.target.value)}
                                    className="w-full p-3 bg-gray-50 border rounded-xl font-mono text-sm"
                                    placeholder="Optional"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-purple-600 mb-1">Facebook Access Token (CAPI) 🔐</label>
                                <input
                                    type="password"
                                    value={localSettings.facebookAccessToken || ""}
                                    onChange={(e) => handleChange("facebookAccessToken", e.target.value)}
                                    className="w-full p-3 bg-purple-50 border border-purple-100 rounded-xl font-mono text-xs text-purple-800"
                                    placeholder="EAAG..."
                                />
                                <p className="text-[10px] text-purple-400 mt-1">Required for Server-Side Tracking (100% Accuracy)</p>
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Shipping Logic */}
                    <div>
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            🚚 {t('shipping_logic') || "Shipping Logic"}
                        </h4>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 p-3 border-2 rounded-xl cursor-pointer hover:bg-green-50 flex-1 transition"
                                style={{
                                    borderColor: localSettings.shippingMode === 'free' || !localSettings.shippingMode ? '#10b981' : '#e5e7eb',
                                    backgroundColor: localSettings.shippingMode === 'free' || !localSettings.shippingMode ? '#d1fae5' : 'white'
                                }}>
                                <input
                                    type="radio"
                                    name="shippingMode"
                                    value="free"
                                    checked={localSettings.shippingMode === 'free' || !localSettings.shippingMode}
                                    onChange={() => handleChange("shippingMode", 'free')}
                                    className="w-5 h-5 accent-green-600"
                                />
                                <div>
                                    <span className="block text-sm font-bold text-gray-800">{t('free_shipping') || "Free Shipping"}</span>
                                    <span className="text-xs text-gray-500">All orders are free</span>
                                </div>
                            </label>

                            <label className="flex items-center gap-2 p-3 border-2 rounded-xl cursor-pointer hover:bg-blue-50 flex-1 transition"
                                style={{
                                    borderColor: localSettings.shippingMode === 'custom' ? '#3b82f6' : '#e5e7eb',
                                    backgroundColor: localSettings.shippingMode === 'custom' ? '#eff6ff' : 'white'
                                }}>
                                <input
                                    type="radio"
                                    name="shippingMode"
                                    value="custom"
                                    checked={localSettings.shippingMode === 'custom'}
                                    onChange={() => handleChange("shippingMode", 'custom')}
                                    className="w-5 h-5 accent-blue-600"
                                />
                                <div>
                                    <span className="block text-sm font-bold text-gray-800">{t('custom_rates') || "Custom Rates (City)"}</span>
                                    <span className="text-xs text-gray-500">Calculate based on city</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Store Status */}
                    <div className="flex items-center justify-between p-4 bg-gray-100 rounded-xl">
                        <div>
                            <span className="block font-bold text-gray-800">{t('store_status')}</span>
                            <span className={`text-xs font-bold ${isStoreActive ? "text-green-600" : "text-red-500"}`}>
                                {isStoreActive ? `✅ ${t('active')}` : `⛔ ${t('suspended')}`}
                            </span>
                        </div>
                        {isStoreActive ? <ToggleRight className="w-8 h-8 text-green-600 opacity-50 cursor-not-allowed" /> : <ToggleLeft className="w-8 h-8 text-gray-400" />}
                    </div>

                    <button onClick={handleSaveSettings} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg">
                        {t('save')}
                    </button>
                </div>
            </section>
        </div>
    );
}
