import { MetadataRoute } from "next";
import { BASE_URL, CITIES, INTENTS, buildExploreSlug } from "@/lib/seo-config";
import { getStoreData } from "@/lib/server/getStoreData";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // regenerate hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();

    // ── Core static pages ─────────────────────────────────────────────────────
    const staticPages: MetadataRoute.Sitemap = [
        { url: BASE_URL, lastModified: now, priority: 1.0, changeFrequency: "daily" },
        { url: `${BASE_URL}/ar`, lastModified: now, priority: 1.0, changeFrequency: "daily" },
        { url: `${BASE_URL}/ar/products`, lastModified: now, priority: 0.9, changeFrequency: "daily" },
        { url: `${BASE_URL}/ar/best-sellers`, lastModified: now, priority: 0.8, changeFrequency: "weekly" },
        { url: `${BASE_URL}/ar/contact`, lastModified: now, priority: 0.5, changeFrequency: "monthly" },
    ];

    // ── Firestore data via getStoreData (already server-safe + cached) ────────
    let productEntries: MetadataRoute.Sitemap = [];
    let collectionEntries: MetadataRoute.Sitemap = [];
    let categoryIds: string[] = [];

    try {
        const { products, categories } = await getStoreData();

        productEntries = products
            .filter((p) => p.visible !== false)
            .map((p) => ({
                url: `${BASE_URL}/ar/product/${p.id}`,
                lastModified: now,
                priority: 0.85,
                changeFrequency: "weekly" as const,
            }));

        collectionEntries = categories.map((c) => ({
            url: `${BASE_URL}/ar/collection/${c.id}`,
            lastModified: now,
            priority: 0.8,
            changeFrequency: "daily" as const,
        }));

        categoryIds = categories.map((c) => c.id);
    } catch (err) {
        console.error("[sitemap] getStoreData error:", err);
    }

    // ── Explore pages: city × category × intent ───────────────────────────────
    // Fall back to sensible slugs if no categories loaded yet
    const catSlugs = categoryIds.length > 0
        ? categoryIds
        : ["beauty", "home", "sports", "electronics", "fashion", "skincare"];

    const exploreEntries: MetadataRoute.Sitemap = [];
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
