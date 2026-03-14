import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, limit, query } from "firebase/firestore";
import { unstable_cache } from "next/cache";

// Define Interfaces
export interface StoreData {
    settings: any;
    products: any[];
    categories: any[];
}

// Internal fetch function
async function fetchStoreData(): Promise<StoreData> {
    const startTime = Date.now();
    console.log("⚡ [SSR] Starting Firestore Fetch (Nuclear Standard)...");

    try {
        // ⚠️ FETCH 200 PRODUCTS (Optimized Limit to fit 2MB)
        const productsQuery = query(collection(db, "products"), limit(200));

        const [settingsSnap, categoriesSnap, productsSnap] = await Promise.all([
            getDoc(doc(db, "settings", "general")),
            getDocs(collection(db, "categories")),
            getDocs(productsQuery)
        ]);

        // Sanitize Settings
        const rawSettings = settingsSnap.exists() ? settingsSnap.data() : {};

        // Simple Image Validation: Only check if it's a valid image string
        const safeImage = (img: any) => {
            if (typeof img === 'string') {
                // Allow any Base64 or HTTP image - no size restrictions
                return img;
            }
            if (img && typeof img === 'object' && img.url) return img.url;
            return null;
        };

        const settings = {
            heroImage: safeImage(rawSettings.heroImage),
            middleBanner: safeImage(rawSettings.middleBanner),
            middleBannerLink: rawSettings.middleBannerLink,
            showFeatures: rawSettings.showFeatures,
            primaryColor: rawSettings.primaryColor,
            telegramId: rawSettings.telegramId,
        };

        const categories = categoriesSnap.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                image: safeImage(data.image),
            };
        }).slice(0, 50); // Show up to 50 categories

        // Products: Explicit field selection to minimize payload
        const products = productsSnap.docs.map(doc => {
            const data = doc.data();
            const processImages = (imgs: any) => {
                if (Array.isArray(imgs)) {
                    // Return all images for homepage display (limit to 5 for performance)
                    return imgs.slice(0, 5).map(safeImage).filter(Boolean);
                }
                if (imgs) return [safeImage(imgs)].filter(Boolean);
                return [];
            };

            return {
                id: doc.id,
                title: data.title,
                price: data.price,
                originalPrice: data.originalPrice,
                category: data.category,
                images: processImages(data.images || data.image),
                isBestSeller: data.isBestSeller,
                visible: data.visible,
                discountLabel: data.discountLabel,
                stock: data.stock,
                createdAt: data.createdAt,
                // NO description
            };
        });

        const payloadSize = JSON.stringify({ settings, products, categories }).length;
        console.log(`✅ [SSR] Fetch Complete. Found ${products.length} products. Payload: ~${(payloadSize / 1024).toFixed(2)} KB`);

        return {
            settings,
            products,
            categories
        };

    } catch (error) {
        console.error("🔥 [SSR] Store Data Fetch Error:", error);
        return {
            settings: {},
            products: [],
            categories: []
        };
    }
}

// v4: Increased image size limit and cache duration
export const getStoreData = unstable_cache(
    async () => fetchStoreData(),
    ['store-data-v4'],
    { revalidate: 30, tags: ['store-data'] }
);

// Fetch SINGLE Product for SEO (Server Component)
export async function getProduct(id: string) {
    try {
        const docRef = doc(db, "products", id);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
            return { id: snapshot.id, ...snapshot.data() } as any;
        }
        return null;
    } catch (error) {
        console.error("Error fetching product:", error);
        return null;
    }
}
