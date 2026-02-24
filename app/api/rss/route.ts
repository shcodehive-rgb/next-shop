import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, limit } from "firebase/firestore";

// Always fresh — no stale cache for automation tools
export const revalidate = 0;

const BASE_URL = "https://store.idmisk.com";

interface Product {
    id: string;
    title: string | { ar?: string; en?: string; fr?: string };
    price: string;
    image?: string;
    images?: string[];
    description?: string | { ar?: string; en?: string; fr?: string };
    category?: string;
    visible?: boolean;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function escapeXml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

/** Prefer Arabic, fall back to English then French */
function getTitle(title: Product["title"]): string {
    if (typeof title === "string") return title;
    return title.ar || title.en || title.fr || "Product";
}

/** Prefer Arabic description, fall back to English */
function getDescription(desc: Product["description"]): string {
    if (!desc) return "";
    if (typeof desc === "string") return desc;
    return desc.ar || desc.en || desc.fr || "";
}

function getPrimaryImage(product: Product): string {
    if (product.images && product.images.length > 0) return product.images[0];
    return product.image || "";
}

function cleanPrice(price: string): string {
    return price.replace(/[^0-9.]/g, "").trim() || "0";
}

// ── Data fetching ─────────────────────────────────────────────────────────────

async function fetchProducts(): Promise<Product[]> {
    const snap = await getDocs(query(collection(db, "products"), limit(1000)));
    const products: Product[] = [];

    snap.forEach((doc) => {
        const d = doc.data();
        // Skip invisible / draft products
        if (d.visible === false) return;
        if (!d.title || !d.price) return;
        if (!d.image && (!d.images || d.images.length === 0)) return;

        products.push({
            id: doc.id,
            title: d.title,
            price: String(d.price),
            image: d.image,
            images: d.images,
            description: d.description,
            category: d.category,
            visible: d.visible,
        });
    });

    return products;
}

// ── XML builder ───────────────────────────────────────────────────────────────

function buildRss(products: Product[]): string {
    const now = new Date().toUTCString();

    const items = products
        .map((product) => {
            const title = escapeXml(getTitle(product.title));
            const rawDesc = getDescription(product.description) || getTitle(product.title);
            const description = escapeXml(rawDesc.substring(0, 3000));
            const link = `${BASE_URL}/product/${product.id}`;
            const imageUrl = getPrimaryImage(product);
            const price = cleanPrice(product.price);

            // <enclosure> is the standard RSS way to attach a media URL
            const enclosure = imageUrl
                ? `<enclosure url="${escapeXml(imageUrl)}" type="image/jpeg" length="0" />`
                : "";

            // media:content for broader tool compatibility
            const mediaContent = imageUrl
                ? `<media:content url="${escapeXml(imageUrl)}" medium="image" />`
                : "";

            return `  <item>
    <title>${title}</title>
    <description>${description}</description>
    <link>${escapeXml(link)}</link>
    <guid isPermaLink="true">${escapeXml(link)}</guid>
    ${enclosure}
    ${mediaContent}
    <price xmlns="https://store.idmisk.com/rss">${price} MAD</price>
    <category>${escapeXml(product.category || "General")}</category>
    <pubDate>${now}</pubDate>
  </item>`;
        })
        .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Idmisk Store — Products</title>
    <link>${BASE_URL}</link>
    <atom:link href="${BASE_URL}/api/rss" rel="self" type="application/rss+xml" />
    <description>Product feed for automated social media posting</description>
    <language>ar</language>
    <lastBuildDate>${now}</lastBuildDate>
    <ttl>60</ttl>
${items}
  </channel>
</rss>`;
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function GET() {
    try {
        const products = await fetchProducts();
        const xml = buildRss(products);

        return new NextResponse(xml, {
            status: 200,
            headers: {
                "Content-Type": "application/rss+xml; charset=utf-8",
                // Revalidate every 5 minutes for automation tools
                "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=60",
            },
        });
    } catch (err) {
        console.error("RSS feed error:", err);

        const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>Error</title><description>Failed to generate RSS feed</description></channel></rss>`;

        return new NextResponse(errorXml, {
            status: 500,
            headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
        });
    }
}
