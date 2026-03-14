"use client";

import { useState, useEffect } from "react";
import { useShop, Product } from "@/context/ShopContext";
import { useLocale } from "next-intl";
import { Search, Truck } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function EquipementsPage() {
    const { products, searchQuery, setSearchQuery, addToCart } = useShop();
    const locale = useLocale();
    const router = useRouter();
    const isAr = locale === 'ar';

    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

    // Category title for this page
    const categoryTitle = isAr ? 'معدات وإكسسوارات' : 'ÉQUIPEMENTS & ACCESSOIRES';

    // Filter products specifically for equipments/accessories
    useEffect(() => {
        if (!products || products.length === 0) return;

        let filtered = products.filter(product => {
            const pCat = product.category?.toString().toLowerCase().trim() || "";
            const pCats = product.categories?.map(c => c.toLowerCase().trim()) || [];

            // Match against various common ways accessories are named in the data
            const isEquipement = [
                'accessoires de sport',
                'aksiswar',
                'accessoires',
                'accessories',
                'equipements',
                'équipement',
                'gear'
            ].some(term => pCat.includes(term) || pCats.some(c => c.includes(term)));

            return isEquipement;
        });

        // Search filter within this category
        if (searchQuery) {
            filtered = filtered.filter(product =>
                product.title?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredProducts(filtered);
    }, [products, searchQuery]);

    const navigateTo = (slug: string) => {
        if (slug === 'all') {
            router.push(`/${locale}/collections/all`);
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
                    {/* Left Sidebar - Narrower w-60 */}
                    <div className="w-60 flex-shrink-0 text-left">
                        <div className="bg-white rounded-xl p-6">
                            <h3 className="font-bold text-gray-900 mb-4 text-lg">
                                {isAr ? 'الفئات' : 'Catégories'}
                            </h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => navigateTo('all')}
                                    className="w-full text-left px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
                                >
                                    {isAr ? 'جميع المنتجات' : 'Tous les produits'}
                                </button>

                                <button
                                    className="w-full text-left px-4 py-3 rounded-lg transition-colors bg-black text-white font-medium"
                                >
                                    {isAr ? 'معدات وإكسسوارات' : 'Équipements & Accessoires'}
                                </button>

                                <button
                                    onClick={() => navigateTo('packs-offres')}
                                    className="w-full text-left px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
                                >
                                    {isAr ? 'باقات وعروض' : 'Packs & Offres'}
                                </button>

                                <button
                                    onClick={() => navigateTo('arts-martiaux')}
                                    className="w-full text-left px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
                                >
                                    {isAr ? 'فنون قتالية' : 'Arts Martiaux'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Product Grid */}
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
                                    <div key={product.id} className="group cursor-pointer w-full">
                                        <div className="aspect-[4/5] overflow-hidden w-full">
                                            <img
                                                src={product.image}
                                                alt={typeof product.title === 'string' ? product.title : JSON.stringify(product.title)}
                                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 bg-white"
                                            />
                                        </div>

                                        <div className="w-full">
                                            <button
                                                onClick={() => {
                                                    addToCart(product);
                                                    toast.success(isAr ? 'تمت إضافة المنتج للسلة' : 'Product added to cart!');
                                                }}
                                                className="w-full bg-black text-white font-light tracking-wider text-xs uppercase py-3 hover:bg-gray-800 transition-colors"
                                            >
                                                {isAr ? 'شراء سريع' : 'ACHAT RAPIDE'}
                                            </button>
                                        </div>

                                        <div className="text-center mt-3">
                                            <h3 className="font-semibold text-gray-900 mb-2 text-sm leading-tight">
                                                {typeof product.title === 'string'
                                                    ? product.title
                                                    : (product.title[locale as keyof typeof product.title] || (product.title as any).en || (product.title as any).fr)
                                                }
                                            </h3>
                                            <p className="text-lg font-bold text-gray-900">{product.price} DH</p>
                                        </div>
                                    </div>
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
