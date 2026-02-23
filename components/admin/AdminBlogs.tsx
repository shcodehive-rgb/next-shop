"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp, query, orderBy } from "firebase/firestore";
import { toast } from "sonner";
import { Loader2, Plus, FileText, Trash, Pencil, ExternalLink, Image as ImageIcon } from "lucide-react";
import dynamic from 'next/dynamic';
import { useTranslations } from "next-intl";

// Dynamic Import for Quill (No SSR)
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

interface BlogDoc {
    id: string;
    title: string;
    slug: string;
    content: string;
    thumbnail: string;
    excerpt: string;
    seoDescription: string;
    publishDate: string;
    author: string;
    status: 'draft' | 'published';
    createdAt: any;
    updatedAt: any;
}

// Quill modules for image upload support
const quillModules = {
    toolbar: {
        container: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'script': 'sub'}, { 'script': 'super' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'font': [] }],
            [{ 'align': [] }],
            ['link', 'image', 'video'],
            ['clean']
        ],
        handlers: {
            image: imageHandler
        }
    }
};

// Image handler for Quill editor
function imageHandler() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
        const file = input.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target?.result as string;
                const quill = (window as any).quill;
                if (quill) {
                    const range = quill.getSelection();
                    quill.insertEmbed(range ? range.index : 0, 'image', imageUrl);
                }
            };
            reader.readAsDataURL(file);
        }
    };
}

export default function AdminBlogs() {
    const [blogs, setBlogs] = useState<BlogDoc[]>([]);
    const [loading, setLoading] = useState(false);
    const t = useTranslations('Admin');

    // Editor State
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ 
        title: "", 
        content: "", 
        thumbnail: "",
        excerpt: "",
        seoDescription: "",
        publishDate: new Date().toISOString().split('T')[0],
        author: "Admin",
        status: "draft" as "draft" | "published"
    });

    // Fetch Blogs
    useEffect(() => {
        const q = query(collection(db, "blogs"), orderBy("updatedAt", "desc"));
        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogDoc));
            setBlogs(data);
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
        // Auto-generate slug from title (no manual slug input)
        const slug = generateSlug(title);
        setFormData({ 
            ...formData, 
            title, 
            excerpt: formData.excerpt || title.substring(0, 150) + "..."
        });
    };

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const thumbnail = event.target?.result as string;
                setFormData({ ...formData, thumbnail });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.content) {
            toast.error(t('error_required'));
            return;
        }

        setLoading(true);
        try {
            const blogData = {
                ...formData,
                slug: generateSlug(formData.title),
                excerpt: formData.excerpt || formData.content.substring(0, 150) + "...",
                updatedAt: serverTimestamp()
            };

            if (editId) {
                // Update
                await updateDoc(doc(db, "blogs", editId), blogData);
                toast.success(t('success_update'));
            } else {
                // Create
                await addDoc(collection(db, "blogs"), {
                    ...blogData,
                    createdAt: serverTimestamp()
                });
                toast.success(t('success_add'));
            }
            // Reset
            setIsEditing(false);
            setEditId(null);
            setFormData({ 
                title: "", 
                content: "", 
                thumbnail: "",
                excerpt: "",
                seoDescription: "",
                publishDate: new Date().toISOString().split('T')[0],
                author: "Admin",
                status: "draft" as "draft" | "published"
            });
        } catch (error) {
            console.error(error);
            toast.error(t('error_generic'));
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (blog: BlogDoc) => {
        setEditId(blog.id);
        setFormData({ 
            title: blog.title, 
            content: blog.content, 
            thumbnail: blog.thumbnail,
            excerpt: blog.excerpt,
            seoDescription: blog.seoDescription,
            publishDate: blog.publishDate,
            author: blog.author,
            status: blog.status
        });
        setIsEditing(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('delete_confirm'))) return;
        try {
            await deleteDoc(doc(db, "blogs", id));
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
                    <FileText className="w-5 h-5 text-emerald-600" />
                    {t('manage_blogs')}
                </h3>
                <button
                    onClick={() => {
                        setIsEditing(!isEditing);
                        setEditId(null);
                        setFormData({ 
                            title: "", 
                            content: "", 
                            thumbnail: "",
                            excerpt: "",
                            seoDescription: "",
                            publishDate: new Date().toISOString().split('T')[0],
                            author: "Admin",
                            status: "draft" as "draft" | "published"
                        });
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${isEditing ? 'bg-gray-200 text-gray-700' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                >
                    {isEditing ? t('cancel') : <><Plus className="w-4 h-4" /> {t('new_article')}</>}
                </button>
            </div>

            {/* EDITOR FORM */}
            {isEditing && (
                <section className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Cover Image Upload */}
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">{t('cover_image')}</label>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleThumbnailChange}
                                            className="hidden"
                                            id="thumbnail-upload"
                                        />
                                        <label 
                                            htmlFor="thumbnail-upload"
                                            className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-100 transition"
                                        >
                                            <ImageIcon className="w-5 h-5 text-gray-400" />
                                            <span className="text-gray-600">
                                                {formData.thumbnail ? t('change_image') : t('upload_cover_image')}
                                            </span>
                                        </label>
                                    </div>
                                </div>
                                {formData.thumbnail && (
                                    <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-200">
                                        <img 
                                            src={formData.thumbnail} 
                                            alt="Cover" 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-1">{t('article_title')}</label>
                                <input
                                    value={formData.title}
                                    onChange={handleTitleChange}
                                    className="w-full p-3 bg-gray-50 border rounded-xl font-bold"
                                    placeholder={t('article_title_placeholder')}
                                    dir="auto"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-1">{t('publish_date')}</label>
                                <input
                                    type="date"
                                    value={formData.publishDate}
                                    onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border rounded-xl font-bold"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-1">{t('author')}</label>
                                <input
                                    value={formData.author}
                                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border rounded-xl font-bold"
                                    placeholder={t('author_name')}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-1">{t('status')}</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "draft" | "published" })}
                                    className="w-full p-3 bg-gray-50 border rounded-xl font-bold"
                                >
                                    <option value="draft">{t('draft')}</option>
                                    <option value="published">{t('published')}</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">{t('excerpt')}</label>
                            <textarea
                                value={formData.excerpt}
                                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                className="w-full p-3 bg-gray-50 border rounded-xl resize-none h-20"
                                placeholder={t('excerpt_placeholder')}
                                rows={3}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">{t('seo_description')}</label>
                            <textarea
                                value={formData.seoDescription}
                                onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                                className="w-full p-3 bg-gray-50 border rounded-xl resize-none h-20"
                                placeholder={t('seo_description_placeholder')}
                                rows={3}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">{t('content')}</label>
                            <div className="bg-white rounded-xl overflow-hidden [&_.ql-toolbar]:border-gray-200 [&_.ql-container]:border-gray-200 [&_.ql-editor]:min-h-[300px] [&_.ql-editor]:text-lg">
                                <ReactQuill
                                    theme="snow"
                                    value={formData.content}
                                    onChange={(value) => setFormData({ ...formData, content: value })}
                                    modules={quillModules}
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : (editId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
                            <span>{editId ? t('update_article') : t('publish_article')}</span>
                        </button>
                    </form>
                </section>
            )}

            {/* BLOG LIST */}
            {!isEditing && (
                <div className="grid grid-cols-1 gap-3">
                    {blogs.map(blog => (
                        <div key={blog.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between hover:shadow-md transition">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                    {blog.thumbnail ? (
                                        <img src={blog.thumbnail} alt={blog.title} className="w-8 h-8 rounded object-cover" />
                                    ) : (
                                        <FileText className="w-5 h-5" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{blog.title}</h4>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <span className="font-mono">/blog/{blog.slug}</span>
                                        <span>•</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                            blog.status === 'published' 
                                                ? 'bg-emerald-100 text-emerald-700' 
                                                : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {blog.status}
                                        </span>
                                        <span>•</span>
                                        <span>{blog.publishDate}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <a href={`/blog/${blog.slug}`} target="_blank" className="p-2 text-gray-400 hover:text-emerald-600 transition" title="View">
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                                <button onClick={() => handleEdit(blog)} className="p-2 text-gray-400 hover:text-orange-500 transition" title="Edit">
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(blog.id)} className="p-2 text-gray-400 hover:text-red-500 transition" title="Delete">
                                    <Trash className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {blogs.length === 0 && (
                        <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-3xl border border-dashed">
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>{t('no_articles_yet')}</p>
                            <button onClick={() => setIsEditing(true)} className="text-emerald-600 font-bold mt-2 hover:underline">{t('add_first_article')}</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
