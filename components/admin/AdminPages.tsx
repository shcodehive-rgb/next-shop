"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp, query, orderBy } from "firebase/firestore";
import { toast } from "sonner";
import { Loader2, Plus, FileText, Trash, Pencil, ExternalLink } from "lucide-react";
import dynamic from 'next/dynamic';
import { useTranslations } from "next-intl";

// Dynamic Import for Quill (No SSR)
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

interface PageDoc {
    id: string;
    title: string;
    slug: string;
    content: string;
    updatedAt: any;
}

export default function AdminPages() {
    const [pages, setPages] = useState<PageDoc[]>([]);
    const [loading, setLoading] = useState(false);
    const t = useTranslations('Admin');

    // Editor State
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ title: "", slug: "", content: "" });

    // Fetch Pages
    useEffect(() => {
        const q = query(collection(db, "pages"), orderBy("updatedAt", "desc"));
        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as PageDoc));
            setPages(data);
        });
        return () => unsub();
    }, []);

    // Slug Generator
    const generateSlug = (text: string) => {
        return text.toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove non-word chars
            .replace(/\s+/g, '-') // Replace spaces with -
            .trim();
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        // Only auto-generate slug if adding new page
        if (!editId) {
            setFormData({ ...formData, title, slug: generateSlug(title) });
        } else {
            setFormData({ ...formData, title });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.slug) {
            toast.error(t('error_required'));
            return;
        }

        setLoading(true);
        try {
            if (editId) {
                // Update
                await updateDoc(doc(db, "pages", editId), {
                    ...formData,
                    updatedAt: serverTimestamp()
                });
                toast.success(t('success_update'));
            } else {
                // Create
                await addDoc(collection(db, "pages"), {
                    ...formData,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
                toast.success(t('success_add'));
            }
            // Reset
            setIsEditing(false);
            setEditId(null);
            setFormData({ title: "", slug: "", content: "" });
        } catch (error) {
            console.error(error);
            toast.error(t('error_generic'));
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (page: PageDoc) => {
        setEditId(page.id);
        setFormData({ title: page.title, slug: page.slug, content: page.content });
        setIsEditing(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('delete_confirm'))) return;
        try {
            await deleteDoc(doc(db, "pages", id));
            toast.success(t('success_delete'));
        } catch (error) {
            toast.error(t('error_generic'));
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header / Toggle */}
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    {t('manage_pages')}
                </h3>
                <button
                    onClick={() => {
                        setIsEditing(!isEditing);
                        setEditId(null);
                        setFormData({ title: "", slug: "", content: "" });
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${isEditing ? 'bg-gray-200 text-gray-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                    {isEditing ? t('cancel') : <><Plus className="w-4 h-4" /> {t('new_page')}</>}
                </button>
            </div>

            {/* EDITOR FORM */}
            {isEditing && (
                <section className="bg-white p-6 rounded-3xl shadow-sm border border-blue-100">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-1">{t('page_title')}</label>
                                <input
                                    value={formData.title}
                                    onChange={handleTitleChange}
                                    className="w-full p-3 bg-gray-50 border rounded-xl font-bold"
                                    placeholder={t('page_title_placeholder')}
                                    dir="auto"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-1">{t('page_slug')}</label>
                                <div className="flex items-center bg-gray-50 border rounded-xl px-3">
                                    <span className="text-gray-400 text-sm">/pages/</span>
                                    <input
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        className="w-full p-3 bg-transparent outline-none font-mono text-sm ltr:text-left rtl:text-right"
                                        placeholder="privacy-policy"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">{t('content')}</label>
                            <div className="bg-white rounded-xl overflow-hidden [&_.ql-toolbar]:border-gray-200 [&_.ql-container]:border-gray-200 [&_.ql-editor]:min-h-[300px] [&_.ql-editor]:text-lg">
                                <ReactQuill
                                    theme="snow"
                                    value={formData.content}
                                    onChange={(value) => setFormData({ ...formData, content: value })}
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : (editId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
                            <span>{editId ? t('update_page') : t('publish_page')}</span>
                        </button>
                    </form>
                </section>
            )}

            {/* PAGED LIST */}
            {!isEditing && (
                <div className="grid grid-cols-1 gap-3">
                    {pages.map(page => (
                        <div key={page.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between hover:shadow-md transition">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{page.title}</h4>
                                    <span className="text-xs text-gray-400 font-mono">/pages/{page.slug}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <a href={`/pages/${page.slug}`} target="_blank" className="p-2 text-gray-400 hover:text-blue-600 transition" title="View">
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                                <button onClick={() => handleEdit(page)} className="p-2 text-gray-400 hover:text-orange-500 transition" title="Edit">
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(page.id)} className="p-2 text-gray-400 hover:text-red-500 transition" title="Delete">
                                    <Trash className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {pages.length === 0 && (
                        <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-3xl border border-dashed">
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>{t('no_pages_yet')}</p>
                            <button onClick={() => setIsEditing(true)} className="text-blue-600 font-bold mt-2 hover:underline">{t('add_first_page')}</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
