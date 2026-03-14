"use client";

import { useState, useEffect } from "react";
import { useShop, Product } from "@/context/ShopContext";
import { useLocale } from "next-intl";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import ProductCard from "@/components/shop/ProductCard";

export default function CollectionsAllPage() {
    const { products, searchQuery, setSearchQuery, addToCart } = useShop();
    const locale = useLocale();
    const router = useRouter();
    const isAr = locale === 'ar';

    const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Filter products based on search and category
    useEffect(() => {
        let filtered = products;

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(product =>
                product.title?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(product => {
                const pCat = product.category?.toString().toLowerCase().trim() || "";
                const pCats = product.categories?.map(c => c.toLowerCase().trim()) || [];
                const target = selectedCategory.toLowerCase();

                // Match against slug or various common names
                if (pCat === target || pCats.includes(target)) return true;

                if (target === 'equipements') {
                    return ['accessoires de sport', 'aksiswar', 'accessoires', 'accessories', 'equipements', 'gear'].some(term => pCat.includes(term) || pCats.some(c => c.includes(term)));
                }
                if (target === 'packs-offres') {
                    return ['packs & offres', 'packs & offers', 'packs-offres', 'packs', 'offers'].some(term => pCat.includes(term) || pCats.some(c => c.includes(term)));
                }
                if (target === 'arts-martiaux') {
                    return ['arts martiaux', 'arts-martiaux', 'martial arts', 'founoun'].some(term => pCat.includes(term) || pCats.some(c => c.includes(term)));
                }

                return false;
            });
        }

        setFilteredProducts(filtered);
    }, [products, searchQuery, selectedCategory]);

    const navigateTo = (slug: string) => {
        if (slug === 'all') {
            setSelectedCategory('all');
        } else {
            router.push(`/${locale}/collections/${slug}`);
        }
    };

    return (
        <div className="min-h-screen bg-white" dir={isAr ? "rtl" : "ltr"}>
            {/* Header */}
            <div className="bg-white">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                            {isAr ? 'جميع المنتجات' : 'SHOP ALL'}
                        </h1>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            {isAr
                                ? 'اكتشف مجموعتنا الكاملة من المعدات الرياضية والإكسسوارات المتميزة'
                                : 'Découvrez notre collection complète d\'équipements sportifs et accessoires premium'
                            }
                        </p>
                    </div>

                    {/* Search Bar Only */}
                    <div className="flex justify-center">
                        <div className="relative max-w-md w-full">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder={isAr ? "ابحث عن منتج..." : "Search products..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content with Sidebar */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex gap-6">
                    {/* Left Sidebar - Narrower w-60 - Sticky Filter */}
                    <div className="w-60 flex-shrink-0 text-left relative">
                        <div className="sticky top-24 h-fit bg-white rounded-xl p-6 border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4 text-lg">
                                {isAr ? 'الفئات' : 'Catégories'}
                            </h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setSelectedCategory('all')}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${selectedCategory === 'all'
                                        ? 'bg-black text-white font-medium'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    {isAr ? 'جميع المنتجات' : 'Tous les produits'}
                                </button>

                                <button
                                    onClick={() => navigateTo('equipements')}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${selectedCategory === 'equipements'
                                        ? 'bg-black text-white font-medium'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    {isAr ? 'معدات وإكسسوارات' : 'Équipements & Accessoires'}
                                </button>

                                <button
                                    onClick={() => navigateTo('packs-offres')}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${selectedCategory === 'packs-offres'
                                        ? 'bg-black text-white font-medium'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    {isAr ? 'باقات وعروض' : 'Packs & Offres'}
                                </button>

                                <button
                                    onClick={() => navigateTo('arts-martiaux')}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${selectedCategory === 'arts-martiaux'
                                        ? 'bg-black text-white font-medium'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    {isAr ? 'فنون قتالية' : 'Arts Martiaux'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Product Grid - 4 Columns */}
                    <div className="flex-1 max-w-none">
                        {/* Results Count */}
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-gray-600">
                                {isAr
                                    ? `عرض ${filteredProducts.length} من ${products.length} منتج`
                                    : `Showing ${filteredProducts.length} of ${products.length} products`
                                }
                            </p>
                        </div>

                        {/* Products Grid - 4 columns on desktop */}
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <div className="bg-white rounded-xl p-8 max-w-2xl mx-auto border border-gray-100">
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
                                            setSelectedCategory('all');
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
