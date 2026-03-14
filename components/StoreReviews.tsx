"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, limit, where } from "firebase/firestore";
import { Star, User } from "lucide-react";
import { useTranslations } from "next-intl";

export default function StoreReviews() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [lightbox, setLightbox] = useState<string | null>(null);
    const t = useTranslations('StoreReviews');

    useEffect(() => {
        // Fetch last 6 approved reviews
        const q = query(
            collection(db, "reviews"),
            where("status", "==", "approved"),
            orderBy("createdAt", "desc"),
            limit(6)
        );
        const unsub = onSnapshot(q, (snap) => {
            setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return () => unsub();
    }, []);

    if (reviews.length === 0) return null;

    return (
        <div className="container mx-auto px-4 mt-16 mb-12">
            <h3 className="font-black text-3xl text-gray-900 mb-8 flex items-center gap-3">
                <Star className="w-8 h-8 text-emerald-500 fill-emerald-500" />
                {t('title') || "What Our Customers Say"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map(review => (
                    <div key={review.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col group">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center font-black text-lg text-emerald-600 shadow-inner">
                                    {review.reviewer ? review.reviewer.charAt(0).toUpperCase() : <User />}
                                </div>
                                <div>
                                    <h4 className="font-black text-gray-900 leading-tight">{review.reviewer}</h4>
                                    <div className="flex text-emerald-500 text-xs mt-1 gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-3.5 h-3.5 ${i < (review.rating || 5) ? "fill-current" : "text-gray-300"}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-gray-50 px-2.5 py-1 rounded-full">
                                {new Date(review.date).toLocaleDateString("en-GB", { day: 'numeric', month: 'short' })}
                            </span>
                        </div>

                        <p className="text-gray-600 text-sm leading-relaxed mb-6 font-medium italic">
                            "{review.comment}"
                        </p>

                        {/* Photo Gallery - Support for multiple images */}
                        {(review.imageUrls || review.imageUrl) && (
                            <div className="flex gap-2.5 mt-auto">
                                {(review.imageUrls || [review.imageUrl]).filter(Boolean).map((url: string, idx: number) => (
                                    <div
                                        key={idx}
                                        className="relative w-20 h-20 rounded-2xl overflow-hidden border border-gray-100 cursor-zoom-in group-hover:border-emerald-200 transition-colors"
                                        onClick={() => setLightbox(url)}
                                    >
                                        <img src={url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Review proof" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            {lightbox && (
                <div
                    className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4"
                    onClick={() => setLightbox(null)}
                >
                    <img src={lightbox} className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in duration-300" alt="Full review photo" />
                </div>
            )}
        </div>
    );
}
