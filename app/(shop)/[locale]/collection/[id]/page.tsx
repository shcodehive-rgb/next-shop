import { getCategoryData } from "@/lib/server/getCategoryData";
import { getStoreData } from "@/lib/server/getStoreData"; // Import global data fetcher for all categories
import ProductCard from "@/components/shop/ProductCard";
import CategoryFilter from "@/components/shop/CategoryFilter"; // Import Filter Component
import { getTranslations } from "next-intl/server";
import { Package } from "lucide-react";

interface Props {
    params: Promise<{ id: string; locale: string }>;
}

export default async function CollectionPage({ params }: Props) {
    const { id, locale } = await params;
    const { category, products } = await getCategoryData(id);
    const { categories: allCategories } = await getStoreData(); // Fetch all categories for filter
    const t = await getTranslations('Collection');

    // Get category name with translation fallback
    let categoryName = "Category";
    if (category && category.name) {
        if (typeof category.name === 'object' && category.name !== null) {
            categoryName = (category.name as any)[locale] || (category.name as any)['ar'] || (category.name as any)['en'] || (category.name as any)['fr'] || "Category";
        } else {
            categoryName = String(category.name);
        }
    }

    // Filter visible (already done partially in getCategoryData, but double check visible flag)
    const filteredProducts = products.filter(p => p.visible !== false);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 mb-2">{categoryName}</h1>
                        <p className="text-gray-600">
                            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                        </p>
                    </div>

                    {/* Filter Component */}
                    <CategoryFilter categories={allCategories} currentCategoryId={id} />
                </div>

                {/* Products Grid */}
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-400 text-lg">No products in this category yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

