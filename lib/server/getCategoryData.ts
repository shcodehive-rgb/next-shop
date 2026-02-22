import { adminFirestore } from "@/lib/firebase-admin"; // Use Admin SDK
import { unstable_cache } from "next/cache";

export interface CategoryData {
    category: any;
    products: any[];
}

async function fetchCategoryData(categoryId: string): Promise<CategoryData> {
    try {
        console.log(`⚡ [SSR] Fetching Category: ${categoryId}`);
        // Use Admin SDK methods
        const categoryRef = adminFirestore.collection("categories").doc(categoryId);
        const productsRef = adminFirestore.collection("products").limit(500);

        // DEBUG: Check Service Account Project ID
        const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        const serviceAccount = serviceAccountRaw ? JSON.parse(serviceAccountRaw) : null;
        console.log(`🔍 [Debug] NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);
        console.log(`🔍 [Debug] Service Account Project ID: ${serviceAccount?.project_id}`);
        console.log(`🔍 [Debug] Admin SDK Ready.`);


        const [categorySnap, productsSnap] = await Promise.all([
            categoryRef.get(),
            productsRef.get()
        ]);

        console.log(`🔍 [Debug] CategoryId target: ${categoryId}`);
        console.log(`🔍 [Debug] Total Products Fetched: ${productsSnap.size}`);
        if (!productsSnap.empty) {
            const firstDoc = productsSnap.docs[0].data();
            console.log(`🔍 [Debug] First Product Sample: ID=${productsSnap.docs[0].id}, Category=${firstDoc?.category}, Visible=${firstDoc?.visible}`);
        } else {
            console.warn(`⚠️ [Debug] No products found in DB (Limit 500)`);
        }


        const categoryData = categorySnap.exists ? categorySnap.data() : null;
        const category: any = categoryData ? { id: categorySnap.id, ...categoryData } : null;

        const safeImage = (img: any) => {
            if (typeof img === 'string') return img.length > 100000 ? null : img;
            if (img && typeof img === 'object' && img.url) return img.url;
            return null;
        };

        if (category && category.image) {
            category.image = safeImage(category.image);
        }

        const products = productsSnap.docs.map(doc => {
            const data = doc.data();
            const processImages = (imgs: any) => {
                if (Array.isArray(imgs)) return [safeImage(imgs[0])].filter(Boolean);
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
            };
        }).filter(p => {
            const productCat = p.category;

            // Logic: Product stores "Name" (String), URL provides "ID".
            // We must check if productCat matches ANY of the names from the fetched Category Doc.

            if (!category) {
                // Fallback: If category doc lookup failed (maybe URL IS the name?), try direct match
                return String(productCat).toLowerCase() === String(categoryId).toLowerCase();
            }

            const catNameObj = category.name; // {en: "Luxe", ar: "..."} OR "Luxe"

            // 1. If Category Name is Object, check if productCat matches ANY value
            if (typeof catNameObj === 'object' && catNameObj !== null) {
                const match = Object.values(catNameObj).some(val =>
                    String(val).toLowerCase() === String(productCat).toLowerCase()
                );
                if (match) console.log(`✅ MATCH: Product ${p.id} (${productCat}) matches Category Object`);
                return match;
            }

            // 2. If Category Name is String, check direct equality
            const match = String(catNameObj).toLowerCase() === String(productCat).toLowerCase();
            if (match) console.log(`✅ MATCH: Product ${p.id} (${productCat}) matches Category String (${catNameObj})`);
            return match;
        });

        console.log(`✅ [SSR] Final Products Count for Page: ${products.length}`);

        return {
            category,
            products
        };

    } catch (error) {
        console.error("🔥 [SSR] Category Fetch Error:", error);
        return { category: null, products: [] };
    }
}

export const getCategoryData = fetchCategoryData;
