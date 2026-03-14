"use client";

import { useState } from "react";
import { useShop, Product } from "@/context/ShopContext";
import { toast } from "sonner";
import { Save, Plus, Trash2, Edit, Image as ImageIcon, Loader2, Package } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { getProductTitle } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { translateText } from "@/lib/translateText";
import { uploadImageToStorage } from "@/lib/storage-utils";
import { notifyMakeWebhook } from "@/lib/makeWebhook";
import YouTubePlayer from "@/components/YouTubePlayer";

export default function AdminProducts() {
    const { products, addProduct, updateProduct, deleteProduct, categories } = useShop();
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const t = useTranslations('Admin');

    const defaultForm = {
        title: "", price: "", cost: "", category: "equipements", categories: ["equipements"] as string[], stock: 10, description: "", image: "", images: [] as string[],
        wholesalePrice: "", minWholesaleQty: 0, allowAddToCart: true, reviews: [] as any[], isBestSeller: false,
        originalPrice: "", discountLabel: "", shipping_type: "standard" as "standard" | "free",
        variants: [] as string[],
        showInMidPageSlider: false,
        technicalSpecifications: [] as { key: string; value: string }[],
        metaTitle: "", metaDescription: "",
        bundles: [] as { qty: number; price: number; badgeText?: string }[]
    };
    const [formData, setFormData] = useState(defaultForm);

    const handleProductSubmit = async () => {
        if (!formData.title || !formData.price) return toast.error(t('error_required'));

        setLoading(true);
        try {
            // Auto-translate title
            toast.info(t('translating'));
            const translatedTitle = await translateText(formData.title);

            if (editingId) {
                const updateData = {
                    ...formData,
                    title: translatedTitle,
                    originalPrice: formData.originalPrice ? Number(formData.originalPrice) : 0
                };
                await updateProduct(editingId, updateData as Partial<Product>);
                toast.success(t('success_update'));
                setEditingId(null);
            } else {
                const newProduct: Product = {
                    id: Date.now().toString(),
                    ...formData,
                    title: translatedTitle,
                    originalPrice: formData.originalPrice ? Number(formData.originalPrice) : 0,
                    image: formData.images[0] || formData.image || "https://placehold.co/400?text=No+Image",
                    images: formData.images.length > 0 ? formData.images : (formData.image ? [formData.image] : []),
                    createdAt: new Date().toISOString()
                };
                await addProduct(newProduct);
                // 🔔 Notify Make.com — fire-and-forget, never blocks save
                notifyMakeWebhook(newProduct);
                toast.success(t('success_add'));
            }
            setFormData(defaultForm);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (e: any) {
            console.error(e);
            toast.error(t('error_generic'));
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (p: Product) => {
        setEditingId(p.id);

        // Extract title - prefer first available language
        const loadedTitle = getProductTitle(p.title);

        setFormData({
            title: loadedTitle,
            price: p.price,
            cost: p.cost || "",
            category: p.category || (p.categories && p.categories[0]) || "equipements",
            categories: p.categories || (p.category ? [p.category] : ["equipements"]),
            stock: p.stock || 0,
            description: p.description || "",
            image: p.image,
            images: p.images || (p.image ? [p.image] : []),
            wholesalePrice: p.wholesalePrice || "",
            minWholesaleQty: p.minWholesaleQty || 0,
            allowAddToCart: p.allowAddToCart ?? true,
            isBestSeller: p.isBestSeller || false,
            originalPrice: p.originalPrice ? String(p.originalPrice) : "",
            discountLabel: p.discountLabel || "",
            reviews: p.reviews || [],
            variants: p.variants || [],
            showInMidPageSlider: p.showInMidPageSlider || false,
            technicalSpecifications: p.technicalSpecifications || [],

            metaTitle: p.metaTitle || "",
            metaDescription: p.metaDescription || "",
            bundles: p.bundles || [],
            shipping_type: p.shipping_type || "standard"
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Rich Images Upload Handler
    const handleImageUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setLoading(true);
        const toastId = toast.loading("Uploading images to Storage...");
        try {
            const filesArray = Array.from(files);
            const newImageUrls: string[] = [];

            for (const file of filesArray) {
                const url = await uploadImageToStorage(file, "products", {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1200,
                });
                newImageUrls.push(url);
            }

            const updatedImages = [...formData.images, ...newImageUrls].slice(0, 5);
            setFormData({ ...formData, images: updatedImages, image: updatedImages[0] });
            toast.success("Images Uploaded Successfully", { id: toastId });
        } catch (e) {
            console.error(e);
            toast.error("Error uploading images", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const removeGalleryImage = (index: number) => {
        const newImages = formData.images.filter((_, i) => i !== index);
        setFormData({ ...formData, images: newImages, image: newImages[0] || "" });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[900px] mx-auto w-full">
            {/* FORM SECTION */}
            <section className="bg-white p-4 md:p-8 rounded-3xl shadow-lg border border-emerald-100">
                <h3 className="font-black text-2xl text-gray-900 mb-6 flex items-center gap-3">
                    {editingId ? <Edit className="text-blue-600" /> : <Plus className="text-emerald-600" />}
                    {editingId ? t('edit_product') : t('add_new_product')}
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-500 mb-1">
                                {t('product_name')}
                                <span className="text-emerald-600 ml-2">✨ {t('auto_translate_hint')}</span>
                            </label>
                            <input
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full p-3 bg-gradient-to-r from-emerald-50 to-blue-50 border-2 border-emerald-200 rounded-xl font-bold text-gray-900"
                                placeholder={t('product_name_placeholder')}
                                dir="auto"
                            />
                        </div>
                        {/* Variants Field */}
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-500 mb-1">
                                {t('variants') || "Variants / Sizes (Comma separated, e.g. S, M, L)"}
                            </label>
                            <input
                                value={formData.variants ? formData.variants.join(", ") : ""}
                                onChange={e => {
                                    const val = e.target.value;
                                    const arr = val ? val.split(",").map(s => s.trim()).filter(Boolean) : [];
                                    setFormData({ ...formData, variants: arr });
                                }}
                                className="w-full p-3 bg-white border rounded-xl font-medium text-gray-900"
                                placeholder="S, M, L, XL"
                                dir="auto"
                            />
                        </div>
                        {/* Description Field */}
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-500 mb-1">{t('description')}</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full p-3 bg-gray-50 border rounded-xl font-medium text-gray-900 min-h-[100px]"
                                placeholder={t('product_description_placeholder') || "Enter product description..."}
                                dir="auto"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-gray-500 mb-1">{t('price')}</label>
                            <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full p-3 bg-gray-50 border rounded-xl font-bold text-gray-900" />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-gray-500 mb-1">{t('stock')}</label>
                            <input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} className="w-full p-3 bg-gray-50 border rounded-xl font-bold text-gray-900" />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-gray-500 mb-1">{t('wholesale_price')}</label>
                            <input type="number" value={formData.wholesalePrice} onChange={e => setFormData({ ...formData, wholesalePrice: e.target.value })} className="w-full p-3 bg-gray-50 border rounded-xl font-bold text-gray-900" placeholder={t('error_required')} />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-gray-500 mb-1">{t('min_wholesale')}</label>
                            <input type="number" value={formData.minWholesaleQty} onChange={e => setFormData({ ...formData, minWholesaleQty: Number(e.target.value) })} className="w-full p-3 bg-gray-50 border rounded-xl font-bold text-gray-900" />
                        </div>
                        {/* NEW: Technical Specifications */}
                        <div className="col-span-2 border-t pt-4">
                            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                <Plus className="w-4 h-4 text-blue-600" /> {t('technical_specifications') || "Technical Specifications"}
                            </label>
                            <div className="space-y-3">
                                {formData.technicalSpecifications.map((spec, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            placeholder={t('spec_key') || "Key (e.g., Power)"}
                                            value={spec.key}
                                            onChange={(e) => {
                                                const newSpecs = [...formData.technicalSpecifications];
                                                newSpecs[index].key = e.target.value;
                                                setFormData({ ...formData, technicalSpecifications: newSpecs });
                                            }}
                                            className="flex-1 p-2 border rounded-lg font-medium"
                                        />
                                        <input
                                            type="text"
                                            placeholder={t('spec_value') || "Value (e.g., 1500W)"}
                                            value={spec.value}
                                            onChange={(e) => {
                                                const newSpecs = [...formData.technicalSpecifications];
                                                newSpecs[index].value = e.target.value;
                                                setFormData({ ...formData, technicalSpecifications: newSpecs });
                                            }}
                                            className="flex-1 p-2 border rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newSpecs = formData.technicalSpecifications.filter((_, i) => i !== index);
                                                setFormData({ ...formData, technicalSpecifications: newSpecs });
                                            }}
                                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setFormData({
                                        ...formData,
                                        technicalSpecifications: [...formData.technicalSpecifications, { key: "", value: "" }]
                                    })}
                                    className="text-sm font-bold text-blue-700 flex items-center gap-2 hover:underline"
                                >
                                    <Plus className="w-4 h-4" /> {t('add_specification') || "Add New Specification"}
                                </button>
                            </div>
                        </div>

                        {/* Discount Fields */}
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-gray-500 mb-1">{t('original_price')}</label>
                            <input type="number" value={formData.originalPrice} onChange={e => setFormData({ ...formData, originalPrice: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 placeholder-gray-300" placeholder="Optional" />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-gray-500 mb-1">{t('discount_badge')}</label>
                            <input value={formData.discountLabel} onChange={e => setFormData({ ...formData, discountLabel: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 placeholder-gray-300" placeholder="-30% or PROMO" />
                        </div>
                        <div className="col-span-2 p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl">
                            <label className="block text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2">
                                <Package className="w-4 h-4" /> {t('category') || "التصنيف (Multi-Select)"}
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[
                                    { id: 'equipements', label: 'Équipements & Accessoires' },
                                    { id: 'packs-offres', label: 'Packs & Offres' },
                                    { id: 'arts-martiaux', label: 'Arts Martiaux' }
                                ].map((cat) => (
                                    <label key={cat.id} className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${formData.categories.includes(cat.id) ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-white border-gray-100 text-gray-600 hover:border-emerald-200'}`}>
                                        <input
                                            type="checkbox"
                                            checked={formData.categories.includes(cat.id)}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                const newCats = checked
                                                    ? [...formData.categories, cat.id]
                                                    : formData.categories.filter(id => id !== cat.id);
                                                setFormData({
                                                    ...formData,
                                                    categories: newCats,
                                                    category: newCats[0] || "equipements" // Fallback for single field
                                                });
                                            }}
                                            className="w-5 h-5 accent-emerald-400 rounded"
                                        />
                                        <span className="text-sm font-bold">{cat.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="col-span-2 flex flex-wrap gap-3">
                            <label className="flex items-center gap-2 p-3 border rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 flex-1 min-w-[150px]">
                                <input type="checkbox" checked={formData.allowAddToCart} onChange={e => setFormData({ ...formData, allowAddToCart: e.target.checked })} className="w-5 h-5 accent-emerald-600" />
                                <span className="text-sm font-bold text-gray-700">{t('enable_add_to_cart')}</span>
                            </label>
                            <label className="flex items-center gap-2 p-3 border rounded-xl bg-yellow-50 border-yellow-200 cursor-pointer hover:bg-yellow-100 flex-1 min-w-[150px]">
                                <input type="checkbox" checked={formData.isBestSeller} onChange={e => setFormData({ ...formData, isBestSeller: e.target.checked })} className="w-5 h-5 accent-yellow-600" />
                                <span className="text-sm font-bold text-yellow-800">{t('best_seller')}</span>
                            </label>
                            {/* ── Mid-Page Slider Toggle ── */}
                            <label className="flex items-center gap-2 p-3 border-2 rounded-xl bg-purple-50 border-purple-200 cursor-pointer hover:bg-purple-100 flex-1 min-w-[150px]">
                                <input type="checkbox" checked={formData.showInMidPageSlider} onChange={e => setFormData({ ...formData, showInMidPageSlider: e.target.checked })} className="w-5 h-5 accent-purple-600" />
                                <div>
                                    <span className="text-sm font-bold text-purple-800 block">🎬 Mid-Page Slider</span>
                                    <span className="text-[10px] text-purple-500">يظهر في السليدر الأوسط</span>
                                </div>
                            </label>
                        </div>

                        {/* Shipping Type */}
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-500 mb-2">{t('shipping_type')}</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 p-3 border-2 rounded-xl cursor-pointer hover:bg-blue-50 flex-1 transition"
                                    style={{ borderColor: formData.shipping_type === 'standard' || !formData.shipping_type ? '#3b82f6' : '#e5e7eb', backgroundColor: formData.shipping_type === 'standard' || !formData.shipping_type ? '#eff6ff' : 'white' }}>
                                    <input
                                        type="radio"
                                        name="shipping_type"
                                        value="standard"
                                        checked={formData.shipping_type === 'standard' || !formData.shipping_type}
                                        onChange={e => setFormData({ ...formData, shipping_type: 'standard' })}
                                        className="w-5 h-5 accent-blue-600"
                                    />
                                    <span className="text-sm font-bold text-gray-700">{t('standard_rate')}</span>
                                </label>
                                <label className="flex items-center gap-2 p-3 border-2 rounded-xl cursor-pointer hover:bg-green-50 flex-1 transition"
                                    style={{ borderColor: formData.shipping_type === 'free' ? '#10b981' : '#e5e7eb', backgroundColor: formData.shipping_type === 'free' ? '#d1fae5' : 'white' }}>
                                    <input
                                        type="radio"
                                        name="shipping_type"
                                        value="free"
                                        checked={formData.shipping_type === 'free'}
                                        onChange={e => setFormData({ ...formData, shipping_type: 'free' })}
                                        className="w-5 h-5 accent-green-600"
                                    />
                                    <span className="text-sm font-bold text-gray-700">{t('free_shipping')}</span>
                                </label>
                            </div>
                        </div>



                        {/* NEW: BUNDLES / VOLUME DISCOUNTS */}
                        <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
                            <label className="block text-sm font-bold text-emerald-800 mb-4 flex items-center gap-2">
                                <Save className="w-4 h-4" /> {t('bundle_pricing') || "Volume Discounts / Bundles"}
                            </label>

                            <div className="space-y-3 mb-4">
                                {formData.bundles.map((bundle, idx) => (
                                    <div key={idx} className="flex gap-2 items-end bg-white p-3 rounded-lg border shadow-sm">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Qty</label>
                                            <input
                                                type="number"
                                                value={bundle.qty}
                                                onChange={(e) => {
                                                    const newBundles = [...formData.bundles];
                                                    newBundles[idx].qty = Number(e.target.value);
                                                    setFormData({ ...formData, bundles: newBundles });
                                                }}
                                                className="w-20 p-2 border rounded font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Total Price</label>
                                            <input
                                                type="number"
                                                value={bundle.price}
                                                onChange={(e) => {
                                                    const newBundles = [...formData.bundles];
                                                    newBundles[idx].price = Number(e.target.value);
                                                    setFormData({ ...formData, bundles: newBundles });
                                                }}
                                                className="w-24 p-2 border rounded font-bold text-emerald-600"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Badge (Optional)</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Save 20%"
                                                value={bundle.badgeText || ""}
                                                onChange={(e) => {
                                                    const newBundles = [...formData.bundles];
                                                    newBundles[idx].badgeText = e.target.value;
                                                    setFormData({ ...formData, bundles: newBundles });
                                                }}
                                                className="w-full p-2 border rounded"
                                            />
                                        </div>
                                        <button
                                            type="button" // Prevent form submission
                                            onClick={() => {
                                                const newBundles = formData.bundles.filter((_, i) => i !== idx);
                                                setFormData({ ...formData, bundles: newBundles });
                                            }}
                                            className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button" // Prevent form submission
                                onClick={() => setFormData({
                                    ...formData,
                                    bundles: [...formData.bundles, { qty: 2, price: 0, badgeText: "" }]
                                })}
                                className="text-sm font-bold text-emerald-700 flex items-center gap-1 hover:underline"
                            >
                                + Add Bundle Deal
                            </button>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">{t('product_images')}</label>
                            <div className="grid grid-cols-3 gap-2 mb-2">
                                {formData.images.map((img, i) => (
                                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border">
                                        <img src={img} className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => removeGalleryImage(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                ))}
                                {formData.images.length < 5 && (
                                    <div className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center relative hover:border-emerald-500 transition cursor-pointer">
                                        <ImageIcon className="w-6 h-6 text-gray-400 mb-1" />
                                        <span className="text-[10px] font-bold text-gray-400">{t('add_image')}</span>
                                        <input type="file" accept="image/*" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleImageUpload(e.target.files)} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <button onClick={handleProductSubmit} className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold text-white shadow-lg transition flex items-center justify-center gap-2 ${editingId ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-700"}`}>
                    {editingId ? <><Save className="w-4 h-4" /> {t('update')}</> : <><Plus className="w-4 h-4" /> {t('save')}</>}
                </button>

                {/* SEO SECTION (Expandable/Separate) */}
                <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm mt-6">
                    <h3 className="font-bold text-lg text-blue-900 mb-4 flex items-center gap-2">
                        🔍 Search Engine Optimization (SEO)
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Meta Title</label>
                            <input
                                value={formData.metaTitle}
                                onChange={e => setFormData({ ...formData, metaTitle: e.target.value })}
                                className="w-full p-3 bg-blue-50/50 border border-blue-100 rounded-xl font-medium text-gray-900"
                                placeholder={formData.title ? typeof formData.title === 'string' ? formData.title : 'Product Title' : "SEO Title"}
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Leave blank to use Product Name. Recommended length: 50-60 chars.</p>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Meta Description</label>
                            <textarea
                                value={formData.metaDescription}
                                onChange={e => setFormData({ ...formData, metaDescription: e.target.value })}
                                className="w-full p-3 bg-blue-50/50 border border-blue-100 rounded-xl font-medium text-gray-900 h-24"
                                placeholder="Summarize the product for search engines..."
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Leave blank to use Product Description. Recommended length: 150-160 chars.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* LIST SECTION */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">📦 {t('product_list')} <span className="text-sm bg-gray-200 text-gray-600 px-2 py-1 rounded-full">{products.length}</span></h3>
                </div>
                <div className="bg-white rounded-3xl border shadow-sm overflow-hidden relative">
                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-right relative min-w-[600px]">
                            <thead className="bg-gray-50 border-b sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="p-4 text-sm font-bold text-gray-500 whitespace-nowrap bg-gray-50">{t('image')}</th>
                                    <th className="p-4 text-sm font-bold text-gray-500 whitespace-nowrap bg-gray-50">{t('product_name')}</th>
                                    <th className="p-4 text-sm font-bold text-gray-500 whitespace-nowrap bg-gray-50">{t('price')}</th>
                                    <th className="p-4 text-sm font-bold text-gray-500 whitespace-nowrap bg-gray-50">{t('original_price')}</th>
                                    <th className="p-4 text-sm font-bold text-gray-500 whitespace-nowrap bg-gray-50">{t('stock')}</th>
                                    <th className="p-4 text-sm font-bold text-gray-500 whitespace-nowrap bg-gray-50">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {products.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition group">
                                        <td className="p-4 w-20"><img src={p.image} alt={getProductTitle(p.title)} className="w-12 h-12 rounded-lg object-cover bg-gray-100 border" /></td>
                                        <td className="p-4 font-bold text-gray-900">
                                            {/* Handle both string and object titles for display */}
                                            {getProductTitle(p.title)}
                                        </td>
                                        <td className="p-4 font-bold text-emerald-600">{p.price} DH</td>
                                        <td className="p-4 text-gray-500">
                                            {p.originalPrice && (
                                                <span className="line-through text-gray-400 font-medium">
                                                    {p.originalPrice} DH
                                                </span>
                                            )}
                                            {!p.originalPrice && (
                                                <span className="text-gray-300">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-gray-500">{p.stock || 0}</td>
                                        <td className="p-4 flex gap-2">
                                            <button onClick={() => { handleEditClick(p); toast.info("Editing: " + getProductTitle(p.title)); }} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition" title="Edit"><Edit className="w-4 h-4" /></button>
                                            <button onClick={() => { if (confirm(t('delete_confirm'))) deleteProduct(p.id); }} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
}
