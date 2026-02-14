"use client";

import { useShop, Product, Category } from "@/context/ShopContext";
import ProductCard from "@/components/shop/ProductCard";
import { useLocale } from "next-intl";

interface CategoryProductsProps {
    categoryId: string;
    products?: Product[];
    category?: Category;
}

export default function CategoryProducts({ categoryId, products: propProducts, category: propCategory }: CategoryProductsProps) {
    const { products: contextProducts, categories: contextCategories } = useShop();
    const locale = useLocale();

    // Use Props if available (SSR), fallback to Context
    const products = propProducts || contextProducts;

    // Find the category (Prop or Context)
    const category = propCategory || contextCategories.find(c => c.id === categoryId);

    // Filter products by this category
    const categoryProducts = products.filter(p => p.category === categoryId && p.visible !== false);


    if (!category) return null;

    // Hide category if no products
    if (categoryProducts.length === 0) return null;

    // Get category name with translation fallback
    let categoryName = "Category";
    if (category.name) {
        if (typeof category.name === 'object' && category.name !== null) {
            categoryName = (category.name as any)[locale] || (category.name as any)['ar'] || (category.name as any)['en'] || (category.name as any)['fr'] || "Category";
        } else {
            categoryName = String(category.name);
        }
    }

    return (
        <section className="py-8">
            <div className="container mx-auto px-4">
                {/* Category Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-gray-900">{categoryName}</h2>
                    <a
                        href={`/${locale}/collection/${categoryId}`}
                        className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                    >
                        View All →
                    </a>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {categoryProducts.slice(0, 5).map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
}
