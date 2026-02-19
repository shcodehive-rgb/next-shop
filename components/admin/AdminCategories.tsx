"use client";

import { useState } from "react";
import { useShop, Category } from "@/context/ShopContext";
import { toast } from "sonner";
import { Plus, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";
import { db, storage } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import imageCompression from 'browser-image-compression';
import { getProductTitle } from "@/lib/utils";
import { useTranslations } from 'next-intl';
import { translateText } from "@/lib/translateText";

export default function AdminCategories() {
    const { categories, addCategory, deleteCategory } = useShop();
    const [loading, setLoading] = useState(false);
    const t = useTranslations('Admin');

    const [catName, setCatName] = useState("");
    const [catImage, setCatImage] = useState("");

    const handleCategorySubmit = async () => {
        if (!catName) return toast.error(t('error_required'));

        setLoading(true);
        try {
            // Auto-translate category name
            toast.info(t('translating'));
            const translatedName = await translateText(catName);

            const imageRef = catImage || "https://placehold.co/400?text=Category";
            const newCategory: Category = { id: Date.now().toString(), name: translatedName, image: imageRef };

            addCategory(newCategory);
            await setDoc(doc(db, "categories", newCategory.id), newCategory);

            toast.success(t('success_add'));
            setCatName("");
            setCatImage("");
        } catch (e) {
            console.error(e);
            toast.error(t('error_generic'));
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setLoading(true);
        try {
            toast.info("Processing Image...");
            const file = files[0];

            // 1. Compress Image (Client-Side)
            // Goal: Maintain quality but reduce size significantly (e.g., < 100KB for Firestore)
            const compressed = await imageCompression(file, {
                maxSizeMB: 0.1, // Target ~100KB
                maxWidthOrHeight: 600,
                useWebWorker: true,
                initialQuality: 0.7,
                fileType: "image/webp" // efficient format
            });

            // 2. Convert to Base64 (Data URL)
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setCatImage(base64String); // Set state directly
                toast.success("Image Ready (Saved as Text)");
            };
            reader.readAsDataURL(compressed);

        } catch (e: any) {
            console.error("Image Processing Error:", e);
            toast.error(`Error processing image: ${e.message || "Unknown error"}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    📂 {t('manage_categories')}
                </h3>
                <div className="flex flex-col md:flex-row gap-4 items-end bg-gray-50 p-4 rounded-2xl border">
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-bold text-gray-500 mb-1">
                            {t('category_name')}
                            <span className="text-emerald-600 ml-2">✨ {t('auto_translate_hint')}</span>
                        </label>
                        <input
                            value={catName}
                            onChange={e => setCatName(e.target.value)}
                            className="w-full p-3 bg-gradient-to-r from-emerald-50 to-blue-50 border-2 border-emerald-200 rounded-xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder={t('product_name_placeholder')}
                            dir="auto"
                        />
                    </div>

                    <div className="w-32">
                        <label className="block text-xs font-bold text-gray-500 mb-1">{t('category_image')}</label>
                        <div className={`h-12 w-full bg-white border border-dashed border-gray-300 rounded-lg flex items-center justify-center relative hover:bg-emerald-50 cursor-pointer overflow-hidden group ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                            {loading ? (
                                <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                            ) : catImage ? (
                                <img src={catImage} className="w-full h-full object-cover" alt="Category Preview" />
                            ) : (
                                <ImageIcon className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition" />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={e => handleImageUpload(e.target.files)}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleCategorySubmit}
                        disabled={loading}
                        className="h-12 px-6 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg flex items-center gap-2"
                    >
                        {loading ? t('processing') : <><Plus className="w-5 h-5" /> {t('add_category')}</>}
                    </button>
                </div>
            </section>

            {/* Existing Categories */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {categories.map(cat => (
                    <div key={cat.id} className="relative group bg-white p-3 rounded-2xl border hover:shadow-md transition text-center">
                        <img src={cat.image} className="w-16 h-16 mx-auto rounded-full object-cover bg-gray-100 mb-2 border-2 border-white shadow-sm" />
                        <h4 className="font-bold text-gray-800 text-sm">
                            {getProductTitle(cat.name)}
                        </h4>
                        <button
                            onClick={() => { if (confirm(t('delete_confirm'))) deleteCategory(cat.id); }}
                            className="absolute -top-1 -right-1 bg-red-100/90 backdrop-blur text-red-600 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition shadow-sm hover:bg-red-200"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}
                {categories.length === 0 && <span className="text-gray-400 text-sm italic col-span-full text-center py-4">{t('no_categories_yet')}</span>}
            </div>
        </div>
    );
}
