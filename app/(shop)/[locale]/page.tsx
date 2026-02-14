import HomeClient from "@/components/shop/HomeClient";
import { getStoreData } from "@/lib/server/getStoreData";

// Force Dynamic Rendering for Real-time Data on Refresh
export const dynamic = 'force-dynamic';

export default async function Home() {
    const { products, categories, settings } = await getStoreData();

    return (
        <HomeClient
            initialProducts={products}
            initialCategories={categories}
            initialSettings={settings}
        />
    );
}
