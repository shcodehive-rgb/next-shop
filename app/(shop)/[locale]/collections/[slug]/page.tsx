"use client";

import { useState, useEffect } from "react";
import { useShop } from "@/context/ShopContext";
import ProductCard from "@/components/shop/ProductCard";
import { useLocale } from "next-intl";
import { Search, Filter, X, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";

export default function CollectionsSlugPage() {
    const { products, searchQuery, setSearchQuery } = useShop();
    const locale = useLocale();
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const isAr = locale === 'ar';

    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Map slugs to display names and multiple possible filter criteria for data resilience
    const categoryMap: Record<string, { en: string, ar: string, filters: string[] }> = {
        'equipements': {
            en: 'Équipements & Accessoires',
            ar: 'معدات وإكسسوارات',
            filters: ['Équipements & Accessoires', 'Accessoires de Sport', 'Aksiswar', 'equipements', 'Accessories', 'accessoires', 'gear']
        },
        'packs-offres': {
            en: 'Packs & Offres',
            ar: 'باقات وعروض',
            filters: ['Packs & Offres', 'Packs & Offers', 'packs-offres', 'Packs', 'offers']
        },
        'arts-martiaux': {
            en: 'Arts Martiaux',
            ar: 'فنون قتالية',
            filters: ['Arts Martiaux', 'arts-martiaux', 'Martial Arts', 'founoun']
        }
    };

    const currentCategory = categoryMap[slug];
    const categoryTitle = currentCategory ? (isAr ? currentCategory.ar : currentCategory.en) : slug;

    // Filter products based on search and slug
    useEffect(() => {
        if (!products || products.length === 0) return;

        let filtered = [...products];

        // Slug filter (Category filter)
        if (slug && slug !== 'all' && currentCategory) {
            filtered = filtered.filter(product => {
                const pCat = product.category?.toString().toLowerCase().trim() || "";
                const pCats = product.categories?.map(c => c.toLowerCase().trim()) || [];

                // 1. Match against any of the filters in the map
                const matchesFilter = currentCategory.filters.some(f => {
                    const lowF = f.toLowerCase();
                    return lowF === pCat || pCats.includes(lowF);
                });
                if (matchesFilter) return true;

                // 2. Fallback: slugified match
                const targetSlug = slug.toLowerCase();
                if (pCats.includes(targetSlug) || pCat === targetSlug) return true;

                const pCatSlug = pCat.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ & /g, '-').replace(/\s+/g, '-');
                if (pCatSlug === targetSlug) return true;

                // 3. Keyword partial match
                const keywords = targetSlug.split('-');
                return keywords.some(k => k.length > 3 && (pCat.includes(k) || pCats.some(c => c.includes(k))));
            });
        }

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(product =>
                product.title?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredProducts(filtered);
    }, [products, searchQuery, slug, currentCategory]);

    const navigateTo = (newSlug: string) => {
        router.push(`/${locale}/collections/${newSlug}`);
    };

    return (
        <div className="min-h-screen bg-white" dir={isAr ? "rtl" : "ltr"}>
            {/* Header */}
            <div className="bg-white">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 uppercase">
                            {categoryTitle}
                        </h1>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            {isAr
                                ? `اكتشف مجموعتنا من ${categoryTitle} المتميزة`
                                : `Découvrez notre collection de ${categoryTitle} premium`
                            }
                        </p>
                    </div>

                    {/* Search Bar Only */}
                    <div className="flex justify-center">
                        <div className="relative max-w-md w-full">
                            <Search className="absolute left-10 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder={isAr ? "ابحث عن منتج..." : "Search products..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content with Sidebar */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8 w-full">

                    {/* Left Sidebar - Desktop Only (Visibility forced to LG) */}
                    <aside className="!hidden lg:!block w-full lg:w-1/4 shrink-0 relative">
                        <div className="sticky top-24 h-fit bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4 text-lg">
                                {isAr ? 'الفئات' : 'Catégories'}
                            </h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => router.push(`/${locale}/collections/all`)}
                                    className="w-full text-left px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-50"
                                >
                                    {isAr ? 'جميع المنتجات' : 'Tous les produits'}
                                </button>

                                {[
                                    { id: 'equipements', en: 'Équipements & Accessoires', ar: 'معدات وإكسسوارات' },
                                    { id: 'packs-offres', en: 'Packs & Offres', ar: 'باقات وعروض' },
                                    { id: 'arts-martiaux', en: 'Arts Martiaux', ar: 'فنون قتالية' }
                                ].map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => navigateTo(cat.id)}
                                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${slug === cat.id
                                            ? 'bg-emerald-600 text-white font-medium shadow-md'
                                            : 'text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        {isAr ? cat.ar : cat.en}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Right Side - Product Grid - Spans 100% on tablet/mobile */}
                    <div className="w-full lg:w-3/4 flex-1">

                        {/* Results Count */}
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-gray-600">
                                {isAr
                                    ? `عرض ${filteredProducts.length} من ${products.length} منتج`
                                    : `Showing ${filteredProducts.length} of ${products.length} products`
                                }
                            </p>
                        </div>

                        {/* Products Grid - 2 Columns Mobile, 3+ on Larger screens */}
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <div className="bg-white rounded-xl p-8 max-w-2xl mx-auto">
                                    <div className="text-5xl mb-4">🔍</div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {isAr ? 'لا توجد منتجات' : 'No products found'}
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        {isAr
                                            ? 'حاول تعديل الفلاتر أو البحث عن شيء آخر'
                                            : 'Try adjusting your filters or search for something else'
                                        }
                                    </p>
                                    <button
                                        onClick={() => {
                                            router.push(`/${locale}/collections/all`);
                                            setSearchQuery('');
                                        }}
                                        className="bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors"
                                    >
                                        {isAr ? 'مسح الفلاتر' : 'Clear Filters'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
