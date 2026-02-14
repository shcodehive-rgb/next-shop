"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";

export default function HomepageReviews() {
    const [reviews, setReviews] = useState<any[]>([]);
    const t = useTranslations('HomepageReviews');

    useEffect(() => {
        const q = query(collection(db, "homepage_reviews"), orderBy("createdAt", "desc"));
        const unsub = onSnapshot(q, (snap) => {
            setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return () => unsub();
    }, []);

    if (reviews.length === 0) return null;

    return (
        <div className="container mx-auto px-4 mt-8">
            <h3 className="font-bold text-2xl text-gray-900 mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                {t('title')}
            </h3>

            <div className="flex overflow-x-auto gap-4 py-4 pb-8 snap-x">
                {reviews.map(review => (
                    <div
                        key={review.id}
                        className="flex-shrink-0 w-64 md:w-72 bg-gray-50 rounded-2xl border border-gray-100 p-2 snap-center shadow-sm"
                    >
                        <div className="aspect-[9/16] relative overflow-hidden rounded-xl bg-white">
                            {review.imageBase64 ? (
                                <img
                                    src={review.imageBase64}
                                    className="w-full h-full object-contain bg-black/5"
                                    alt="Customer Proof"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
