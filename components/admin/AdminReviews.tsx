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
    imageUrl?: string;
    date: string;
    status: ReviewStatus;
}

async function uploadReviewImage(file: File): Promise<string> {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `reviews/admin/${Date.now()}.${ext}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
}

export default function AdminReviews() {
    const { products } = useShop();
    const [tab, setTab] = useState<ReviewStatus>("pending");
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loadingList, setLoadingList] = useState(true);
    const [lightbox, setLightbox] = useState<string | null>(null);

    // Add-review form
    const [selectedProduct, setSelectedProduct] = useState("");
    const [form, setForm] = useState({ reviewer: "", comment: "" });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [preview, setPreview] = useState("");
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
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
        toast.success("Image selected");
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct || !form.reviewer.trim() || !form.comment.trim()) {
            toast.error("Please fill in all required fields");
            return;
        }
        setSubmitting(true);
        try {
            // Upload image to Firebase Storage if provided
            let imageUrl = "";
            if (imageFile) {
                imageUrl = await uploadReviewImage(imageFile);
            }

            await addDoc(collection(db, "reviews"), {
                productId: selectedProduct,
                reviewer: form.reviewer.trim(),
                comment: form.comment.trim(),
                imageUrl,                         // ← Storage URL, never Base64
                date: new Date().toISOString(),
                status: "approved",
                createdAt: serverTimestamp(),
            });
            toast.success("Review added and published!");
            setForm({ reviewer: "", comment: "" });
            setImageFile(null);
            setPreview("");
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

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* ── ADD REVIEW FORM ── */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border space-y-5">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-emerald-600" />
                    Add Custom Review
                </h3>
                <form onSubmit={handleAdd} className="space-y-4 max-w-2xl">
                    {/* Product */}
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Reviewer Name */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Customer Name *</label>
                            <input
                                value={form.reviewer}
                                onChange={e => setForm(p => ({ ...p, reviewer: e.target.value }))}
                                placeholder="e.g. Fatima B."
                                className="w-full p-3 bg-gray-50 border rounded-xl text-sm"
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
                            className="w-full p-3 bg-gray-50 border rounded-xl text-sm resize-none"
                        />
                    </div>

                    {/* Photo Upload */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Customer Photo (optional)</label>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold transition"
                            >
                                <Camera className="w-4 h-4" /> Upload Photo
                            </button>
                            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
                            {preview && (
                                <div className="relative">
                                    <img src={preview} className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-400" />
                                    <button
                                        type="button"
                                        onClick={() => { setImageFile(null); setPreview(""); if (fileRef.current) fileRef.current.value = ""; }}
                                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-black"
                                    >×</button>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1.5">Uploaded directly to Firebase Storage (no Base64, no size limits)</p>
                    </div>

                    <button
                        disabled={submitting}
                        className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-900 transition"
                    >
                        {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        Publish Review Immediately
                    </button>
                </form>
            </section>

            {/* ── MANAGE REVIEWS ── */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
                <h3 className="font-bold text-lg text-gray-800">Manage Reviews</h3>

                {/* Pending / Approved Toggle */}
                <div className="flex bg-gray-100 p-1 rounded-xl w-fit gap-1">
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

                {/* Tab label */}
                <p className="text-sm text-gray-500">
                    {tab === "pending"
                        ? "These reviews are hidden from customers. Approve the ones you want to publish."
                        : "These reviews are live and visible on the product pages."}
                </p>

                {/* List */}
                {loadingList ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin w-6 h-6 text-gray-300" /></div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        {tab === "pending" ? "No pending reviews — you're all caught up! 🎉" : "No approved reviews yet."}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {reviews.map(review => (
                            <div key={review.id} className="border border-gray-100 rounded-2xl p-4 flex gap-4 hover:bg-gray-50 transition">
                                {/* Photo thumbnail */}
                                {review.imageUrl && (
                                    <button onClick={() => setLightbox(review.imageUrl!)} className="flex-shrink-0">
                                        <img src={review.imageUrl} className="w-20 h-20 rounded-xl object-cover border border-gray-200 cursor-zoom-in hover:opacity-90 transition" />
                                    </button>
                                )}
                                {/* Text */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 flex-wrap">
                                        <div>
                                            <span className="font-black text-gray-900 text-sm">{review.reviewer}</span>
                                            <span className="mx-2 text-gray-300">·</span>
                                            <span className="text-xs text-gray-400">{getProductName(review.productId)}</span>
                                        </div>
                                        <span className="text-xs text-gray-400 shrink-0">{formatDate(review.date)}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">{review.comment}</p>
                                </div>
                                {/* Actions */}
                                <div className="flex flex-col gap-2 shrink-0">
                                    {tab === "pending" && (
                                        <button
                                            onClick={() => handleApprove(review.id)}
                                            className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
                                        >
                                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(review.id)}
                                        className="flex items-center gap-1 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Delete
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
                    className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setLightbox(null)}
                >
                    <img src={lightbox} className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" alt="Review" />
                </div>
            )}
        </div>
    );
}
