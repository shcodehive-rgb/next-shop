"use client";

import { useShop } from "@/context/ShopContext";
import { toast } from "sonner";
import imageCompression from 'browser-image-compression';
import { fileToBase64 } from "@/lib/utils";
import { useTranslations } from "next-intl";

export default function AdminDesign() {
    const { settings, updateSettings } = useShop();
    const t = useTranslations('Admin');

    const handleSaveSettings = () => {
        toast.success(t('design_saved'));
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    🎨 {t('store_design')}
                </h3>
                <div className="space-y-4">
                    {/* Hero Image */}
                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-1">{t('hero_banner')}</label>
                        <input
                            type="file" accept="image/*"
                            onChange={async (e) => {
                                if (e.target.files?.[0]) {
                                    toast.info(t('processing'));
                                    const file = e.target.files[0];
                                    const compressed = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1920, useWebWorker: true, initialQuality: 0.8 });
                                    const base64 = await fileToBase64(compressed);
                                    updateSettings({ heroImage: base64 });
                                    toast.success(t('banner_updated'));
                                }
                            }}
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                        />
                        {settings.heroImage && (
                            <div className="mt-4 w-full h-48 rounded-xl overflow-hidden border shadow-sm relative group">
                                <img src={settings.heroImage} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                    <span className="text-white font-bold">{t('current_preview')}</span>
                                </div>
                            </div>
                        )}
                        <p className="text-xs text-gray-400 mt-1">{t('hero_hint')}</p>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Middle Banner */}
                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-1">{t('middle_banner')}</label>
                        <input
                            type="file" accept="image/*"
                            onChange={async (e) => {
                                if (e.target.files?.[0]) {
                                    toast.info(t('processing'));
                                    const file = e.target.files[0];
                                    const compressed = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: true, initialQuality: 0.8 });
                                    const base64 = await fileToBase64(compressed);
                                    updateSettings({ middleBanner: base64 });
                                    toast.success(t('banner_updated'));
                                }
                            }}
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                        />
                        {settings.middleBanner && (
                            <div className="mt-4 w-full h-32 rounded-xl overflow-hidden border shadow-sm relative group">
                                <img src={settings.middleBanner} className="w-full h-full object-cover" />
                                <button onClick={() => updateSettings({ middleBanner: "" })} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-lg">✖</button>
                            </div>
                        )}
                        <div className="mt-2">
                            <input
                                value={settings.middleBannerLink || ""}
                                onChange={(e) => updateSettings({ middleBannerLink: e.target.value })}
                                className="w-full p-3 bg-gray-50 border rounded-xl font-mono text-sm"
                                placeholder={t('banner_link_placeholder')}
                            />
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Features Toggle */}
                    <div>
                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 border">
                            <span className="font-bold text-gray-700">{t('show_features')}</span>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={settings.showFeatures !== false} onChange={(e) => updateSettings({ showFeatures: e.target.checked })} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            </div>
                        </label>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Primary Color */}
                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-1">{t('primary_color')}</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={settings.primaryColor || "#10b981"}
                                onChange={(e) => updateSettings({ primaryColor: e.target.value })}
                                className="h-14 w-20 p-1 bg-white border rounded-xl cursor-pointer"
                            />
                            <div className="flex-1">
                                <input
                                    value={settings.primaryColor || "#10b981"}
                                    onChange={(e) => updateSettings({ primaryColor: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border rounded-xl font-mono uppercase font-bold"
                                />
                                <p className="text-xs text-gray-400 mt-1">{t('primary_color_hint')}</p>
                            </div>
                        </div>
                    </div>

                    <button onClick={handleSaveSettings} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:brightness-110 transition shadow-lg mt-4">
                        {t('save_design')}
                    </button>
                </div>
            </section>
        </div>
    );
}
