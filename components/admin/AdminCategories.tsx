"use client";

import { useState } from "react";
import { useShop, Category } from "@/context/ShopContext";
import { toast } from "sonner";
import { Plus, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import imageCompression from 'browser-image-compression';
import { fileToBase64 } from "@/lib/utils";

export default function AdminCategories() {
    const { categories, addCategory, deleteCategory } = useShop();
    const [catName, setCatName] = useState("");
    const [catImage, setCatImage] = useState("");
    const [catFile, setCatFile] = useState<File | null>(null);
    const [uploadingCat, setUploadingCat] = useState(false);

    const handleCategorySubmit = async () => {
        if (!catName) return toast.error("Name is required");
        setUploadingCat(true);
        try {
            let imageBase64 = "https://placehold.co/100x100?text=No+Img";
            if (catFile) {
                const compressedFile = await imageCompression(catFile, {
                    maxSizeMB: 0.3, maxWidthOrHeight: 1024, useWebWorker: true, initialQuality: 0.8
                });
                imageBase64 = await fileToBase64(compressedFile);
            } else if (catImage && !catImage.startsWith("blob:")) {
                imageBase64 = catImage;
            }

            const newCategory: Category = { id: Date.now().toString(), name: catName, image: imageBase64 };
            addCategory(newCategory);
            await setDoc(doc(db, "categories", newCategory.id), newCategory);
            toast.success("Category Added ✅");
            setCatName(""); setCatImage(""); setCatFile(null);
        } catch (e: any) {
            console.error(e);
            toast.error("Error: " + e.message);
        } finally {
            setUploadingCat(false);
        }
    };

    const handleCatImageSelection = (file: File) => {
        if (!file) return;
        setCatFile(file);
        setCatImage(URL.createObjectURL(file));
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    📂 إدارة التصنيفات
                </h3>
                <div className="flex flex-col md:flex-row gap-4 items-end bg-gray-50 p-4 rounded-2xl border">
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-bold text-gray-500 mb-1">اسم التصنيف</label>
                        <input
                            value={catName}
                            onChange={e => setCatName(e.target.value)}
                            className="w-full p-2 border rounded-lg h-12 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="مثال: إلكترونيات"
                        />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-bold text-gray-500 mb-1">صورة التصنيف</label>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white border flex-shrink-0 overflow-hidden flex items-center justify-center text-gray-300">
                                {catImage ? <img src={catImage} className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6" />}
                            </div>
                            <label className="flex-1 h-12 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition gap-2 text-gray-500 font-bold text-xs relative overflow-hidden">
                                <span>{uploadingCat ? "جاري..." : "اختر صورة"}</span>
                                <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleCatImageSelection(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" disabled={uploadingCat} />
                            </label>
                        </div>
                    </div>
                    <button onClick={handleCategorySubmit} disabled={uploadingCat} className="bg-gray-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-black transition text-sm h-12 w-full md:w-auto flex items-center justify-center shrink-0">
                        {uploadingCat ? <Loader2 className="animate-spin" /> : <Plus className="w-5 h-5" />}
                    </button>
                </div>
                <div className="flex flex-wrap gap-3">
                    {categories.map(c => (
                        <div key={c.id} className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm animate-in zoom-in duration-300">
                            <span className="font-bold text-xs">{c.name}</span>
                            <button onClick={() => { if (confirm('Delete category?')) deleteCategory(c.id) }} className="text-red-400 hover:text-red-600 bg-white rounded-full p-0.5 transition"><Trash2 className="w-3 h-3" /></button>
                        </div>
                    ))}
                    {categories.length === 0 && <span className="text-gray-400 text-sm italic">لا توجد تصنيفات بعد.</span>}
                </div>
            </section>
        </div>
    );
}
