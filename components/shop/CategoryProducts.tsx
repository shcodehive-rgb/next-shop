"use client";

import { useShop, Product, Category } from "@/context/ShopContext";
import ProductCard from "@/components/shop/ProductCard";
import { useLocale } from "next-intl";

// All visible products appear in their category — no price-based hiding

interface CategoryProductsProps {
    categoryId: string;
    products?: Product[];
    category?: Category;
}

export default function CategoryProducts({ categoryId, products: propProducts, category: propCategory }: CategoryProductsProps) {
    const { products: contextProducts, categories: contextCategories } = useShop();
    const locale = useLocale();

    const products = propProducts || contextProducts;
    const category = propCategory || contextCategories.find(c => c.id === categoryId);

    // Show all visible products in this category (no price threshold)
    const categoryProducts = products.filter(p =>
        p.category === categoryId &&
        p.visible !== false
    );

    if (!category) return null;
    if (categoryProducts.length === 0) return null;

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
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-gray-900">{categoryName}</h2>
                    <a
                        href={`/${locale}/collection/${categoryId}`}
                        className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                    >
                        View All →
                    </a>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {categoryProducts.slice(0, 5).map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
}
