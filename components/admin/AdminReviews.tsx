"use client";

import { useState, useEffect, useRef } from "react";
import { useShop } from "@/context/ShopContext";
import {
    collection, addDoc, serverTimestamp, getDocs,
    deleteDoc, doc, updateDoc, query, where
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { getProductTitle } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2, Plus, Camera, Trash2, CheckCircle, Clock, Eye } from "lucide-react";

type ReviewStatus = "pending" | "approved";

interface Review {
    id: string;
    productId: string;
    reviewer: string;
    comment: string;
    imageUrls?: string[]; // Multiple images support
    imageUrl?: string;    // Legacy single image
    date: string;
    status: ReviewStatus;
    rating?: number;      // Star rating support
}

async function uploadReviewImages(files: File[]): Promise<string[]> {
    const urls: string[] = [];
    for (const file of files) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `reviews/admin/${Date.now()}_${Math.random().toString(36).substr(2, 5)}.${ext}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        urls.push(url);
    }
    return urls;
}

export default function AdminReviews() {
    const { products } = useShop();
    const [tab, setTab] = useState<ReviewStatus>("pending");
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loadingList, setLoadingList] = useState(true);
    const [lightbox, setLightbox] = useState<string | null>(null);

    // Add-review form
    const [selectedProduct, setSelectedProduct] = useState("");
    const [form, setForm] = useState({ reviewer: "", comment: "", rating: 5 });
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => { fetchReviews(); }, [tab]);

    const fetchReviews = async () => {
        setLoadingList(true);
        try {
            const q = query(collection(db, "reviews"), where("status", "==", tab));
            const snap = await getDocs(q);
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Review));
            data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setReviews(data);
        } catch (e) {
            toast.error("Failed to load reviews");
        } finally {
            setLoadingList(false);
        }
    };

    const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        if (imageFiles.length + files.length > 3) {
            toast.error("Maximum 3 photos allowed");
            return;
        }

        const newFiles = [...imageFiles, ...files];
        setImageFiles(newFiles);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews([...previews, ...newPreviews]);
        toast.success(`${files.length} photo(s) selected`);
    };

    const removeImage = (index: number) => {
        const newFiles = [...imageFiles];
        newFiles.splice(index, 1);
        setImageFiles(newFiles);

        const newPreviews = [...previews];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct || !form.reviewer.trim() || !form.comment.trim()) {
            toast.error("Please fill in all required fields");
            return;
        }
        setSubmitting(true);
        try {
            // Upload images to Firebase Storage
            const imageUrls = await uploadReviewImages(imageFiles);

            await addDoc(collection(db, "reviews"), {
                productId: selectedProduct,
                reviewer: form.reviewer.trim(),
                comment: form.comment.trim(),
                imageUrls,                         // High-end multi-photo support
                rating: form.rating,
                date: new Date().toISOString(),
                status: "approved",
                createdAt: serverTimestamp(),
            });
            toast.success("Review added and published!");

            // Success cleanup
            setForm({ reviewer: "", comment: "", rating: 5 });
            setImageFiles([]);
            setPreviews([]);
            setSelectedProduct("");
            if (fileRef.current) fileRef.current.value = "";
            if (tab === "approved") fetchReviews();
        } catch (e) {
            toast.error("Failed to add review");
        } finally {
            setSubmitting(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await updateDoc(doc(db, "reviews", id), { status: "approved" });
            toast.success("Review approved and published!");
            setReviews(prev => prev.filter(r => r.id !== id));
        } catch {
            toast.error("Failed to approve review");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this review permanently?")) return;
        try {
            await deleteDoc(doc(db, "reviews", id));
            toast.success("Review deleted");
            setReviews(prev => prev.filter(r => r.id !== id));
        } catch {
            toast.error("Failed to delete review");
        }
    };

    const getProductName = (productId: string) =>
        getProductTitle(products.find(p => p.id === productId)?.title) || productId;

    const formatDate = (iso: string) => {
        try { return new Date(iso).toLocaleDateString("fr-MA", { year: "numeric", month: "short", day: "numeric" }); }
        catch { return ""; }
    };

    const StarRating = ({ rating, interactive = false, onChange }: { rating: number, interactive?: boolean, onChange?: (n: number) => void }) => (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
                <Star
                    key={star}
                    className={`w-4 h-4 cursor-pointer transition-colors ${star <= rating ? "text-emerald-500 fill-emerald-500" : "text-gray-300"}`}
                    onClick={() => interactive && onChange?.(star)}
                />
            ))}
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* ── ADD REVIEW FORM ── */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border space-y-5">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-emerald-600" />
                    Add Custom Review with Photos
                </h3>
                <form onSubmit={handleAdd} className="space-y-4 max-w-2xl">
                    {/* Product & Rating */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Product *</label>
                            <select
                                value={selectedProduct}
                                onChange={e => setSelectedProduct(e.target.value)}
                                className="w-full p-3 bg-gray-50 border rounded-xl font-bold text-sm"
                            >
                                <option value="">-- Select a product --</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{getProductTitle(p.title)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Star Rating</label>
                            <div className="p-3 bg-gray-50 border rounded-xl h-[46px] flex items-center">
                                <StarRating rating={form.rating} interactive onChange={(n) => setForm(f => ({ ...f, rating: n }))} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Reviewer Name */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Customer Name *</label>
                            <input
                                value={form.reviewer}
                                onChange={e => setForm(p => ({ ...p, reviewer: e.target.value }))}
                                placeholder="e.g. Yassine or Salma"
                                className="w-full p-3 bg-gray-50 border rounded-xl text-sm font-bold"
                            />
                        </div>
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Comment *</label>
                        <textarea
                            value={form.comment}
                            onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
                            rows={3}
                            placeholder="Write the review text..."
                            className="w-full p-3 bg-gray-50 border rounded-xl text-sm resize-none leading-relaxed"
                        />
                    </div>

                    {/* Photo Upload */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Customer Photos (up to 3)</label>
                        <div className="flex flex-wrap items-center gap-3">
                            {previews.map((src, idx) => (
                                <div key={idx} className="relative">
                                    <img src={src} className="w-20 h-20 rounded-xl object-cover border-2 border-emerald-400" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(idx)}
                                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-black shadow-md"
                                    >×</button>
                                </div>
                            ))}

                            {previews.length < 3 && (
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    className="flex flex-col items-center justify-center gap-1 w-20 h-20 bg-gray-50 border-2 border-dashed border-gray-300 hover:border-emerald-400 hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 rounded-xl transition group"
                                >
                                    <Camera className="w-5 h-5" />
                                    <span className="text-[10px] font-bold">Add Photo</span>
                                </button>
                            )}
                            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImagePick} />
                        </div>
                        <p className="text-xs text-gray-400 mt-2 font-medium">✨ Photos are stored securely in Firebase Storage</p>
                    </div>

                    <button
                        disabled={submitting}
                        className="flex items-center gap-3 bg-black text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-gray-800 transition active:scale-95 disabled:bg-gray-400 shadow-xl"
                    >
                        {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                        {submitting ? "Publishing..." : "PUBLISH REVIEW NOW"}
                    </button>
                </form>
            </section>

            {/* ── MANAGE REVIEWS ── */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-gray-800">Manage Reviews</h3>
                    <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
                        <button
                            onClick={() => setTab("pending")}
                            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-sm transition ${tab === "pending" ? "bg-amber-500 text-white shadow" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            <Clock className="w-4 h-4" /> Pending
                        </button>
                        <button
                            onClick={() => setTab("approved")}
                            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-sm transition ${tab === "approved" ? "bg-emerald-600 text-white shadow" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            <Eye className="w-4 h-4" /> Approved
                        </button>
                    </div>
                </div>

                {loadingList ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin w-6 h-6 text-gray-300" /></div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        {tab === "pending" ? "No pending reviews — you're all caught up! 🎉" : "No approved reviews yet."}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map(review => (
                            <div key={review.id} className="border border-gray-100 rounded-3xl p-5 flex flex-col sm:flex-row gap-5 hover:bg-gray-50 transition relative group">
                                {/* Photo gallery */}
                                <div className="flex gap-2 flex-wrap">
                                    {(review.imageUrls || (review.imageUrl ? [review.imageUrl] : [])).map((url, idx) => (
                                        <button key={idx} onClick={() => setLightbox(url)} className="flex-shrink-0">
                                            <img src={url} className="w-20 h-20 rounded-2xl object-cover border border-gray-200 cursor-zoom-in hover:scale-105 transition" />
                                        </button>
                                    ))}
                                    {(!review.imageUrls?.length && !review.imageUrl) && (
                                        <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-300">
                                            <Camera className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>

                                {/* Text content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <h4 className="font-black text-gray-900">{review.reviewer}</h4>
                                            <p className="text-xs font-bold text-gray-400 truncate max-w-[200px]">{getProductName(review.productId)}</p>
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 font-mono">{formatDate(review.date)}</span>
                                    </div>
                                    <StarRating rating={review.rating || 5} />
                                    <p className="text-sm text-gray-600 mt-3 leading-relaxed italic">"{review.comment}"</p>
                                </div>

                                {/* Actions */}
                                <div className="flex sm:flex-col gap-2 shrink-0 justify-end sm:justify-start">
                                    {tab === "pending" && (
                                        <button
                                            onClick={() => handleApprove(review.id)}
                                            className="flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex-1"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Approve
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(review.id)}
                                        className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex-1"
                                    >
                                        <Trash2 className="w-4 h-4" /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Lightbox */}
            {lightbox && (
                <div
                    className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300"
                    onClick={() => setLightbox(null)}
                >
                    <button className="absolute top-6 right-6 text-white bg-white/10 p-3 rounded-full hover:bg-white/20 transition">×</button>
                    <img src={lightbox} className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl" alt="Review" />
                </div>
            )}
        </div>
    );
}
