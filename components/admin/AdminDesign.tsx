"use client";

import { useShop } from "@/context/ShopContext";
import { toast } from "sonner";
import imageCompression from 'browser-image-compression';
import { fileToBase64 } from "@/lib/utils";

export default function AdminDesign() {
    const { settings, updateSettings } = useShop();

    const handleSaveSettings = () => {
        toast.success("Design Settings Saved!");
        // Settings are updated in context/localstorage immediately by updateSettings. 
        // If we needed to save to Firebase specifically for settings, we would do it here or in context.
        // Assuming context handles persistence or we trigger it. 
        // (Original code didn't explicitly save settings to firebase in handleSaveSettings, 
        // it just said "Settings Saved!" and relied on context/localstorage or separate logic.
        // Wait, original AdminPage `handleSaveSettings` just toasted. 
        // The real sync happens if we added a `setDoc` for settings. 
        // We should PROBABLY add a save to Firebase here to be safe if that was intended, 
        // but context mostly used local storage for settings in the provided snippet?
        // Actually context `updateSettings` only does `saveSettings` to localStorage.
        // Persistence to Firebase for settings might be missing in original code or handled elsewhere?
        // Ah, `StoreContext` loads settings from localStorage. 
        // The "Kill Switch" loads from Firebase `settings/general`.
        // Let's stick to localStorage as per original code for now to avoid side effects.)
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    🎨 تصميم المتجر
                </h3>
                <div className="space-y-4">
                    {/* Hero Image */}
                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-1">صورة الواجهة (Hero Banner)</label>
                        <input
                            type="file" accept="image/*"
                            onChange={async (e) => {
                                if (e.target.files?.[0]) {
                                    toast.info("Processing Banner...");
                                    const file = e.target.files[0];
                                    const compressed = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1920, useWebWorker: true, initialQuality: 0.8 });
                                    const base64 = await fileToBase64(compressed);
                                    updateSettings({ heroImage: base64 });
                                    toast.success("Banner Updated!");
                                }
                            }}
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                        />
                        {settings.heroImage && (
                            <div className="mt-4 w-full h-48 rounded-xl overflow-hidden border shadow-sm relative group">
                                <img src={settings.heroImage} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                    <span className="text-white font-bold">المعاينة الحالية</span>
                                </div>
                            </div>
                        )}
                        <p className="text-xs text-gray-400 mt-1">يفضل استخدام صورة عريضة (1920x600).</p>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Middle Banner */}
                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-1">بنر إعلاني (وسط الصفحة)</label>
                        <input
                            type="file" accept="image/*"
                            onChange={async (e) => {
                                if (e.target.files?.[0]) {
                                    toast.info("Processing Promo Banner...");
                                    const file = e.target.files[0];
                                    const compressed = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: true, initialQuality: 0.8 });
                                    const base64 = await fileToBase64(compressed);
                                    updateSettings({ middleBanner: base64 });
                                    toast.success("Promo Banner Updated!");
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
                                placeholder="رابط عند الضغط (Ex: /category/offers)"
                            />
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Features Toggle */}
                    <div>
                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 border">
                            <span className="font-bold text-gray-700">shإظهار شريط المميزات (توصيل سريع، ضمان...)</span>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={settings.showFeatures !== false} onChange={(e) => updateSettings({ showFeatures: e.target.checked })} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            </div>
                        </label>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Primary Color */}
                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-1">لون المتجر الرئيسي</label>
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
                                <p className="text-xs text-gray-400 mt-1">يُستخدم في الأزرار والعناوين.</p>
                            </div>
                        </div>
                    </div>

                    <button onClick={handleSaveSettings} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:brightness-110 transition shadow-lg mt-4">
                        حفظ التصميم
                    </button>
                </div>
            </section>
        </div>
    );
}
