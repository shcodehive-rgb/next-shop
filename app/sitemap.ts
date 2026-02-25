import { MetadataRoute } from "next";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { BASE_URL, CITIES, INTENTS, buildExploreSlug } from "@/lib/seo-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();

    // ── Core static pages ──────────────────────────────────────────────────────
    const staticPages: MetadataRoute.Sitemap = [
        { url: BASE_URL, lastModified: now, priority: 1.0, changeFrequency: "daily" },
        { url: `${BASE_URL}/ar`, lastModified: now, priority: 1.0, changeFrequency: "daily" },
        { url: `${BASE_URL}/ar/products`, lastModified: now, priority: 0.9, changeFrequency: "daily" },
        { url: `${BASE_URL}/ar/best-sellers`, lastModified: now, priority: 0.8, changeFrequency: "weekly" },
        { url: `${BASE_URL}/ar/contact`, lastModified: now, priority: 0.5, changeFrequency: "monthly" },
    ];

    // ── Firestore data ─────────────────────────────────────────────────────────
    let productEntries: MetadataRoute.Sitemap = [];
    let collectionEntries: MetadataRoute.Sitemap = [];
    let categoryData: { id: string; slug?: string }[] = [];

    try {
        const [productsSnap, categoriesSnap] = await Promise.all([
            getDocs(query(collection(db, "products"), limit(500))),
            getDocs(collection(db, "categories")),
        ]);

        // Product pages
        productEntries = productsSnap.docs
            .filter((doc) => doc.data().visible !== false)
            .map((doc) => ({
                url: `${BASE_URL}/ar/product/${doc.id}`,
                lastModified: now,
                priority: 0.85,
                changeFrequency: "weekly" as const,
            }));

        // Category collection pages
        categoryData = categoriesSnap.docs.map((doc) => ({
            id: doc.id,
            slug: doc.data().slug || doc.id,
        }));

        collectionEntries = categoryData.map((cat) => ({
            url: `${BASE_URL}/ar/collection/${cat.id}`,
            lastModified: now,
            priority: 0.8,
            changeFrequency: "daily" as const,
        }));
    } catch (err) {
        console.error("[sitemap] Firestore error:", err);
    }

    // ── Programmatic explore pages (city × category × intent) ─────────────────
    const exploreEntries: MetadataRoute.Sitemap = [];

    const catSlugs = categoryData.length > 0
        ? categoryData.map((c) => c.slug || c.id)
        : ["beauty", "home", "sports", "electronics", "fashion"]; // fallback

    for (const intent of INTENTS) {
        for (const catSlug of catSlugs) {
            for (const city of CITIES) {
                exploreEntries.push({
                    url: `${BASE_URL}/explore/${buildExploreSlug(intent.slug, catSlug, city.slug)}`,
                    lastModified: now,
                    priority: 0.7,
                    changeFrequency: "monthly" as const,
                });
            }
        }
    }

    return [...staticPages, ...productEntries, ...collectionEntries, ...exploreEntries];
}
