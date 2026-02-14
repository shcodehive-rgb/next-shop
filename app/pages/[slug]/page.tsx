"use client";

import { useEffect, useState, use } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { notFound } from "next/navigation";

export default function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [page, setPage] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const q = query(collection(db, "pages"), where("slug", "==", slug));
                const snap = await getDocs(q);

                if (!snap.empty) {
                    setPage(snap.docs[0].data());
                } else {
                    setPage(null);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPage();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (!page) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
                <h1 className="text-4xl font-bold text-gray-300">404</h1>
                <p className="text-gray-500">هذه الصفحة غير موجودة</p>
                <a href="/" className="text-emerald-600 hover:underline">العودة للرئيسية</a>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl min-h-[60vh] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 border-b pb-4">
                {page.title}
            </h1>

            <div
                className="prose prose-lg prose-emerald max-w-none 
                prose-headings:font-bold prose-headings:text-gray-800 
                prose-p:text-gray-600 prose-p:leading-relaxed
                prose-a:text-blue-600 hover:prose-a:underline
                bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100"
                dangerouslySetInnerHTML={{ __html: page.content }}
            />
        </div>
    );
}
