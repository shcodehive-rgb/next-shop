"use client";

import { useState } from "react";
import { useShop, Blog } from "@/context/ShopContext";
import { toast } from "sonner";
import { Save, Plus, Trash2, Edit, Eye, Calendar, FileText } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useTranslations } from "next-intl";

export default function AdminBlog() {
    const { blogs, addBlog, updateBlog, deleteBlog } = useShop();
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const t = useTranslations('Admin');

    const defaultForm = {
        title: "",
        thumbnail: "",
        content: "",
        excerpt: "",
        seoDescription: "",
        publishDate: new Date().toISOString().split('T')[0],
        author: "Admin",
        slug: "",
        status: "draft" as "draft" | "published",
    };

    const [formData, setFormData] = useState(defaultForm);

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .trim();
    };

    const handleBlogSubmit = async () => {
        if (!formData.title || !formData.content) return toast.error(t('error_required'));

        setLoading(true);
        try {
            const slug = formData.slug || generateSlug(formData.title);
            const blogData = {
                ...formData,
                slug,
                excerpt: formData.excerpt || formData.content.substring(0, 150) + "...",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            if (editingId) {
                await updateBlog(editingId, blogData);
                toast.success(t('success_update'));
                setEditingId(null);
            } else {
                const newBlog: Blog = {
                    ...blogData,
                    id: Date.now().toString(),
                };
                await addBlog(newBlog);
                toast.success(t('success_add'));
            }
            setFormData(defaultForm);
        } catch (e: any) {
            console.error(e);
            toast.error(t('error_generic'));
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (blog: Blog) => {
        setEditingId(blog.id);
        setFormData({
            title: blog.title,
            thumbnail: blog.thumbnail,
            content: blog.content,
            excerpt: blog.excerpt,
            seoDescription: blog.seoDescription,
            publishDate: blog.publishDate,
            author: blog.author,
            slug: blog.slug,
            status: blog.status,
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id: string) => {
        if (confirm(t('confirm_delete'))) {
            try {
                await deleteBlog(id);
                toast.success(t('success_delete'));
            } catch (e) {
                console.error(e);
                toast.error(t('error_generic'));
            }
        }
    };

    const handleTitleChange = (title: string) => {
        setFormData({
            ...formData,
            title,
            slug: generateSlug(title),
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-3xl shadow-sm border p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <FileText className="w-8 h-8 text-emerald-600" />
                            {t('blog_management')}
                        </h1>
                        <div className="text-sm text-gray-500">
                            {blogs.length} {t('total_articles')}
                        </div>
                    </div>

                    {/* Form */}
                    <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">
                            {editingId ? t('edit_article') : t('create_article')}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        {t('article_title')} *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => handleTitleChange(e.target.value)}
                                        className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder={t('enter_title')}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        {t('slug')}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
                                        placeholder="url-friendly-slug"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        {t('author')}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.author}
                                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                        className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder={t('author_name')}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        {t('publish_date')}
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.publishDate}
                                        onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                                        className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        {t('status')}
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as "draft" | "published" })}
                                        className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="draft">{t('draft')}</option>
                                        <option value="published">{t('published')}</option>
                                    </select>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        {t('thumbnail_url')}
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.thumbnail}
                                        onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                                        className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        {t('excerpt')}
                                    </label>
                                    <textarea
                                        value={formData.excerpt}
                                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                        className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 h-24 resize-none"
                                        placeholder={t('short_description')}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        {t('seo_description')}
                                    </label>
                                    <textarea
                                        value={formData.seoDescription}
                                        onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                                        className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 h-24 resize-none"
                                        placeholder={t('seo_meta_description')}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                {t('content')} *
                            </label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 h-64 resize-none"
                                placeholder={t('article_content')}
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleBlogSubmit}
                                disabled={loading}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                                ) : (
                                    <Save className="w-5 h-5" />
                                )}
                                {editingId ? t('update') : t('create')}
                            </button>
                            {editingId && (
                                <button
                                    onClick={() => {
                                        setEditingId(null);
                                        setFormData(defaultForm);
                                    }}
                                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-colors"
                                >
                                    {t('cancel')}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Blog List */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            {t('published_articles')}
                        </h2>
                        <div className="space-y-4">
                            {blogs.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 font-medium">{t('no_articles')}</p>
                                </div>
                            ) : (
                                blogs.map((blog) => (
                                    <div
                                        key={blog.id}
                                        className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all duration-300"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-bold text-gray-900">
                                                        {blog.title}
                                                    </h3>
                                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                                        blog.status === 'published'
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {blog.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {blog.publishDate}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{blog.author}</span>
                                                </div>
                                                <p className="text-gray-600 line-clamp-2 mb-3">
                                                    {blog.excerpt}
                                                </p>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xs text-gray-500 font-mono">
                                                        /{blog.slug}
                                                    </span>
                                                    {blog.thumbnail && (
                                                        <span className="text-xs text-emerald-600 font-mono">
                                                            🖼️ {t('has_thumbnail')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 ml-4">
                                                <button
                                                    onClick={() => handleEditClick(blog)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title={t('edit')}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(blog.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title={t('delete')}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
