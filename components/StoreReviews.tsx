"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import { Star, User } from "lucide-react";
import { useTranslations } from "next-intl";

export default function StoreReviews() {
    const [reviews, setReviews] = useState<any[]>([]);
    const t = useTranslations('StoreReviews');

    useEffect(() => {
        // Fetch last 6 reviews
        const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"), limit(6));
        const unsub = onSnapshot(q, (snap) => {
            setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return () => unsub();
    }, []);

    if (reviews.length === 0) return null;

    return (
        <div className="container mx-auto px-4 mt-12 mb-8">
            <h3 className="font-black text-2xl text-gray-900 mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                {t('title')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reviews.map(review => (
                    <div key={review.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center font-bold text-lg text-emerald-600">
                                    {review.reviewer ? review.reviewer.charAt(0).toUpperCase() : <User />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{review.reviewer}</h4>
                                    <div className="flex text-yellow-400 text-xs mt-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-current" : "text-gray-300"}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <span className="text-xs text-gray-400 font-mono">
                                {new Date(review.date).toLocaleDateString("en-GB")}
                            </span>
                        </div>

                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                            "{review.comment}"
                        </p>

                        {review.imageBase64 && (
                            <div className="rounded-2xl overflow-hidden border border-gray-100 mt-auto">
                                <img src={review.imageBase64} className="w-full h-48 object-cover" alt="Review proof" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
