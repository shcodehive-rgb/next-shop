"use client";

import { useState, useEffect, useRef } from "react";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Camera, MessageSquare, ChevronUp, Loader2, CheckCircle } from "lucide-react";
import { useLocale } from "next-intl";

interface Review {
    id: string;
    reviewer: string;
    comment: string;
    imageUrl?: string;
    date: string;
}

interface ProductReviewsProps {
    productId: string;
}

/** Upload a File to Firebase Storage and return its public download URL */
async function uploadReviewImage(file: File, productId: string): Promise<string> {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `reviews/${productId}/${Date.now()}.${ext}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
    const locale = useLocale();
    const isAr = locale === "ar";

    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [lightbox, setLightbox] = useState<string | null>(null);

    const [form, setForm] = useState({ reviewer: "", comment: "" });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    // Fetch approved reviews for this product
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const q = query(
                    collection(db, "reviews"),
                    where("productId", "==", productId),
                    where("status", "==", "approved")
                );
                const snap = await getDocs(q);
                const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Review));
                data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setReviews(data);
            } catch (err) {
                console.error("Error loading reviews:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, [productId]);

    const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview("");
        if (fileRef.current) fileRef.current.value = "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.reviewer.trim() || !form.comment.trim()) return;

        setSubmitting(true);
        try {
            // Ensure anonymous auth so Firestore rules pass
            const { auth } = await import("@/lib/firebase");
            const { signInAnonymously } = await import("firebase/auth");
            if (!auth.currentUser) await signInAnonymously(auth);

            // Upload photo to Storage if provided, save only the URL
            let imageUrl = "";
            if (imageFile) {
                imageUrl = await uploadReviewImage(imageFile, productId);
            }

            await addDoc(collection(db, "reviews"), {
                productId,
                reviewer: form.reviewer.trim(),
                comment: form.comment.trim(),
                imageUrl,                         // ← storage URL or ""
                date: new Date().toISOString(),
                status: "pending",
                createdAt: serverTimestamp(),
            });

            setSubmitted(true);
            setForm({ reviewer: "", comment: "" });
            removeImage();
        } catch (err) {
            console.error("Error submitting review:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleDateString(isAr ? "ar-MA" : "fr-MA", {
                year: "numeric", month: "short", day: "numeric"
            });
        } catch { return ""; }
    };

    return (
        <section className="mt-12 pt-10 border-t border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2 font-tajawal">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                    {isAr ? `آراء العملاء (${reviews.length})` : `Customer Reviews (${reviews.length})`}
                </h2>
                <button
                    onClick={() => { setFormOpen(f => !f); setSubmitted(false); }}
                    className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-full transition"
                >
                    {formOpen
                        ? <><ChevronUp className="w-4 h-4" />{isAr ? "إخفاء النموذج" : "Hide Form"}</>
                        : <><MessageSquare className="w-4 h-4" />{isAr ? "أضف رأيك" : "Leave a Review"}</>
                    }
                </button>
            </div>

            {/* Submit Form */}
            {formOpen && (
                <div className="mb-8 bg-gray-50 border border-gray-200 rounded-2xl p-5 animate-in slide-in-from-top-2 duration-300">
                    {submitted ? (
                        <div className="flex flex-col items-center py-6 gap-3 text-center">
                            <CheckCircle className="w-12 h-12 text-emerald-500" />
                            <p className="font-bold text-gray-800 text-lg">
                                {isAr
                                    ? "شكراً! سيتم نشر رأيك بعد المراجعة."
                                    : "Thank you! Your review will appear after approval."}
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">
                                    {isAr ? "اسمك" : "Your Name"}
                                </label>
                                <input
                                    required
                                    value={form.reviewer}
                                    onChange={e => setForm(p => ({ ...p, reviewer: e.target.value }))}
                                    placeholder={isAr ? "مثال: سارة" : "e.g. Sarah"}
                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">
                                    {isAr ? "رأيك في المنتج" : "Your Review"}
                                </label>
                                <textarea
                                    required
                                    value={form.comment}
                                    onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
                                    placeholder={isAr ? "شاركنا تجربتك..." : "Share your experience..."}
                                    rows={3}
                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                />
                            </div>
                            {/* Photo Upload */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2">
                                    {isAr ? "صورة المنتج (اختياري)" : "Product Photo (optional)"}
                                </label>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => fileRef.current?.click()}
                                        className="flex items-center gap-2 bg-white border-2 border-dashed border-gray-300 hover:border-emerald-400 text-gray-600 hover:text-emerald-600 px-4 py-2.5 rounded-xl text-sm font-bold transition"
                                    >
                                        <Camera className="w-4 h-4" />
                                        {isAr ? "أضف صورة" : "Add Photo"}
                                    </button>
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImagePick}
                                    />
                                    {imagePreview && (
                                        <div className="relative">
                                            <img
                                                src={imagePreview}
                                                className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-400"
                                                alt="Preview"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-black"
                                            >×</button>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400 mt-1.5">
                                    {isAr ? "الصورة ترفع مباشرة إلى السيرفر" : "Photo is uploaded directly to storage (no size limits)"}
                                </p>
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition active:scale-95"
                            >
                                {submitting
                                    ? <><Loader2 className="animate-spin w-4 h-4" />{isAr ? "جاري الرفع..." : "Uploading..."}</>
                                    : <><CheckCircle className="w-4 h-4" />{isAr ? "إرسال الرأي" : "Submit Review"}</>
                                }
                            </button>
                        </form>
                    )}
                </div>
            )}

            {/* Reviews List */}
            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin w-6 h-6 text-gray-300" />
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">
                        {isAr
                            ? "لا توجد آراء بعد. كن أول من يشاركنا رأيه!"
                            : "No reviews yet. Be the first to share your experience!"}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map(review => (
                        <div
                            key={review.id}
                            className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 shadow-sm hover:shadow-md transition"
                        >
                            {review.imageUrl && (
                                <button onClick={() => setLightbox(review.imageUrl!)} className="flex-shrink-0">
                                    <img
                                        src={review.imageUrl}
                                        alt="Review photo"
                                        className="w-20 h-20 rounded-xl object-cover border border-gray-200 hover:opacity-90 transition cursor-zoom-in"
                                    />
                                </button>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-gray-900 text-sm">{review.reviewer}</span>
                                    <span className="text-xs text-gray-400">{formatDate(review.date)}</span>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Lightbox */}
            {lightbox && (
                <div
                    className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setLightbox(null)}
                >
                    <img
                        src={lightbox}
                        alt="Review photo"
                        className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
                    />
                </div>
            )}
        </section>
    );
}
