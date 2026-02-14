"use client";

import { useState, useEffect } from "react";
import { useShop } from "@/context/ShopContext";
import { collection, addDoc, serverTimestamp, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getProductTitle } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2, Plus, Star, Image as ImageIcon, Trash2, Edit } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AdminReviews() {
    const { products } = useShop();
    const [selectedProduct, setSelectedProduct] = useState("");
    const [reviewData, setReviewData] = useState({
        reviewer: "",
        rating: 5,
        comment: "",
        imageBase64: ""
    });
    const [loading, setLoading] = useState(false);
    const t = useTranslations('Admin');

    const [reviewType, setReviewType] = useState<'product' | 'homepage'>('product');
    const [reviews, setReviews] = useState<any[]>([]);
    const [homepageReviews, setHomepageReviews] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Fetch reviews on mount
    useEffect(() => {
        fetchReviews();
    }, [reviewType]);

    const fetchReviews = async () => {
        try {
            if (reviewType === 'product') {
                const snapshot = await getDocs(collection(db, "reviews"));
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setReviews(data);
            } else {
                const snapshot = await getDocs(collection(db, "homepage_reviews"));
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setHomepageReviews(data);
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
        }
    };

    // --- BASE64 COMPRESSION LOGIC ---
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                // Canvas Compression
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;

                // Max Width 800px (Keep quality decent)
                if (width > 800) {
                    height *= 800 / width;
                    width = 800;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx?.drawImage(img, 0, 0, width, height);

                // Convert to Base64 (JPEG, 0.6 Quality)
                const optimizedBase64 = canvas.toDataURL("image/jpeg", 0.6);
                setReviewData(prev => ({ ...prev, imageBase64: optimizedBase64 }));
                toast.success(t('image_ready'));
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (reviewType === 'product') {
            if (!selectedProduct || !reviewData.reviewer || !reviewData.comment) {
                toast.error(t('error_required'));
                return;
            }
        } else {
            if (!reviewData.imageBase64) {
                toast.error(t('error_image_required'));
                return;
            }
        }

        setLoading(true);
        try {
            if (reviewType === 'product') {
                // Save to root collection: reviews (General Store Reviews)
                await addDoc(collection(db, "reviews"), {
                    ...reviewData,
                    productId: selectedProduct, // Keep reference just in case
                    date: new Date().toISOString(),
                    createdAt: serverTimestamp()
                });
            } else {
                // Save to root collection: homepage_reviews
                await addDoc(collection(db, "homepage_reviews"), {
                    imageBase64: reviewData.imageBase64,
                    createdAt: serverTimestamp()
                });
            }

            toast.success(t('success_add'));
            setReviewData({ reviewer: "", rating: 5, comment: "", imageBase64: "" });
            setEditingId(null);
            fetchReviews(); // Refresh list
        } catch (error) {
            console.error("Error saving review:", error);
            toast.error(t('error_generic'));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('delete_confirm'))) return;

        try {
            const collectionName = reviewType === 'product' ? 'reviews' : 'homepage_reviews';
            await deleteDoc(doc(db, collectionName, id));
            toast.success(t('success_delete'));
            fetchReviews();
        } catch (error) {
            console.error("Error deleting review:", error);
            toast.error(t('error_generic'));
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="bg-white p-6 rounded-3xl shadow-sm border space-y-6">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    {t('add_review')}
                </h3>

                <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                    <button
                        onClick={() => setReviewType('product')}
                        className={`flex-1 py-2 rounded-lg font-bold text-sm transition ${reviewType === 'product' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                    >
                        {t('product_review')}
                    </button>
                    <button
                        onClick={() => setReviewType('homepage')}
                        className={`flex-1 py-2 rounded-lg font-bold text-sm transition ${reviewType === 'homepage' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                    >
                        {t('social_proof')}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">

                    {/* 1. Select Product (Only for Product Review) */}
                    {reviewType === 'product' && (
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">{t('product')}</label>
                            <select
                                value={selectedProduct}
                                onChange={(e) => setSelectedProduct(e.target.value)}
                                className="w-full p-3 bg-gray-50 border rounded-xl font-bold"
                            >
                                <option value="">-- {t('select_product')} --</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {getProductTitle(p.title)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* 2. Reviewer Info (Only for Product Review) */}
                    {reviewType === 'product' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-1">{t('reviewer_name')}</label>
                                <input
                                    value={reviewData.reviewer}
                                    onChange={(e) => setReviewData({ ...reviewData, reviewer: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border rounded-xl"
                                    placeholder="Ahmed..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-1">{t('rating')}</label>
                                <select
                                    value={reviewData.rating}
                                    onChange={(e) => setReviewData({ ...reviewData, rating: Number(e.target.value) })}
                                    className="w-full p-3 bg-gray-50 border rounded-xl font-mono"
                                >
                                    <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                                    <option value="4">⭐⭐⭐⭐ (4)</option>
                                    <option value="3">⭐⭐⭐ (3)</option>
                                    <option value="2">⭐⭐ (2)</option>
                                    <option value="1">⭐ (1)</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* 3. Comment (Only for Product Review) */}
                    {reviewType === 'product' && (
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">{t('comment')}</label>
                            <textarea
                                value={reviewData.comment}
                                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                                className="w-full p-3 bg-gray-50 border rounded-xl h-24"
                                placeholder={t('comment_placeholder')}
                            />
                        </div>
                    )}

                    {/* 4. Image Upload (Base64) */}
                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-1">
                            {reviewType === 'product' ? t('customer_image') : t('screenshot')}
                        </label>
                        <div className="flex items-center gap-4">
                            <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-3 rounded-xl flex items-center gap-2 transition">
                                <ImageIcon className="w-5 h-5" />
                                <span>{t('choose_image')}</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                            {reviewData.imageBase64 && (
                                <div className="w-16 h-16 rounded-lg overflow-hidden border border-emerald-500 relative">
                                    <img src={reviewData.imageBase64} className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Maximum Width: 800px (Compressed Automatically for Free Storage)</p>
                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-900 transition flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Plus className="w-5 h-5" />}
                        <span>{t('save_review')}</span>
                    </button>
                </form>
            </section>

            {/* REVIEWS LIST */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
                <h3 className="font-bold text-lg text-gray-800">
                    {reviewType === 'product' ? 'Existing Product Reviews' : 'Existing Social Proof Images'}
                </h3>

                {reviewType === 'product' ? (
                    <div className="space-y-3">
                        {reviews.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">No reviews yet</p>
                        ) : (
                            reviews.map((review) => (
                                <div key={review.id} className="border rounded-xl p-4 flex items-start gap-4 hover:bg-gray-50 transition">
                                    {review.imageBase64 && (
                                        <img src={review.imageBase64} className="w-16 h-16 rounded-lg object-cover" />
                                    )}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-gray-900">{review.reviewer}</span>
                                            <span className="text-yellow-500">{"⭐".repeat(review.rating)}</span>
                                        </div>
                                        <p className="text-sm text-gray-600">{review.comment}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(review.id)}
                                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {homepageReviews.length === 0 ? (
                            <p className="col-span-full text-gray-400 text-center py-8">No social proof images yet</p>
                        ) : (
                            homepageReviews.map((review) => (
                                <div key={review.id} className="relative group">
                                    <img src={review.imageBase64} className="w-full aspect-square rounded-xl object-cover" />
                                    <button
                                        onClick={() => handleDelete(review.id)}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}
