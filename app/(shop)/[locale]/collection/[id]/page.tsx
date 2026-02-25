import { getCategoryData } from "@/lib/server/getCategoryData";
import CollectionClient from "@/components/shop/CollectionClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
    params: Promise<{ id: string; locale: string }>;
}

export default async function CollectionPage({ params }: Props) {
    const { id, locale } = await params;
    const { category, products } = await getCategoryData(id);

    // Resolve category name server-side, pass as plain string
    let categoryName = "Category";
    if (category?.name) {
        if (typeof category.name === 'object' && category.name !== null) {
            categoryName = (category.name as any)[locale]
                || (category.name as any)['ar']
                || (category.name as any)['en']
                || (category.name as any)['fr']
                || "Category";
        } else {
            categoryName = String(category.name);
        }
    }

    // Visible filter — server-side before pass to client
    const visibleProducts = products.filter(p => p.visible !== false);

    return (
        <CollectionClient
            initialProducts={visibleProducts}
            categoryName={categoryName}
        />
    );
}
