import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, limit } from "firebase/firestore";

// Cache disabled for immediate updates
export const revalidate = 0;

interface Product {
    id: string;
    title: string | { ar: string; en: string; fr: string };
    price: string;
    originalPrice?: number;
    image: string;
    images?: string[];
    description?: string;
    stock?: number;
    category: string;
    visible?: boolean;
}

// Helper function to escape XML special characters
function escapeXml(unsafe: string): string {
    if (!unsafe) return "";
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;")
        .replace(/\n/g, "&#10;")
        .replace(/\r/g, "&#13;")
        .replace(/\t/g, "&#9;");
}

// Helper function to get title in preferred language
function getTitle(title: string | { ar: string; en: string; fr: string }): string {
    if (typeof title === "string") return title;
    return title.ar || title.en || title.fr || "Product";
}

// Helper function to get primary image
function getPrimaryImage(product: Product): string {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        return product.images[0];
    }
    return product.image || "";
}

// Fetch all products from Firestore
async function fetchActiveProducts(): Promise<Product[]> {
    try {
        const productsQuery = query(
            collection(db, "products"),
            limit(1000)
        );

        const querySnapshot = await getDocs(productsQuery);
        const products: Product[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();

            // Only include visible products that have required fields
            if (data.visible !== false && data.title && data.price) {
                products.push({
                    id: doc.id,
                    title: data.title,
                    price: data.price,
                    originalPrice: data.originalPrice,
                    image: data.image,
                    images: data.images,
                    description: data.description,
                    stock: data.stock,
                    category: data.category,
                    visible: data.visible
                });
            }
        });

        console.log(`✅ Fetched ${products.length} products for Google feed`);
        return products;
    } catch (error) {
        console.error("🔥 Error fetching products for Google feed:", error);
        return [];
    }
}

// Generate XML for Google Merchant Center
function generateXML(products: Product[]): string {
    const baseUrl = "https://store.idmisk.com";

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
<title>Luxe Store</title>
<link>${baseUrl}</link>
<description>Luxe Store - Premium Products Catalog</description>
`;

    products.forEach((product) => {
        const title = getTitle(product.title);
        const description = product.description
            ? escapeXml(product.description.substring(0, 5000)) // Limit description length to 5000
            : escapeXml(title); // Use title as fallback description

        // Link defaults to Arabic store layout
        const link = `${baseUrl}/ar/product/${product.id}`;

        const imageLink = getPrimaryImage(product);

        // Google requires ISO 4217 Currency (e.g., MAD). Clean the value first.
        const cleanPrice = product.price.toString().replace(/[^0-9.]/g, "").trim();
        const price = cleanPrice ? `${cleanPrice} MAD` : "0 MAD";

        // Google feed requires availability string ('in_stock', 'out_of_stock', 'preorder')
        const availability = (product.stock === undefined || product.stock > 0) ? "in_stock" : "out_of_stock";

        xml += `<item>
<g:id>${escapeXml(product.id)}</g:id>
<g:title>${escapeXml(title)}</g:title>
<g:description>${description}</g:description>
<g:link>${escapeXml(link)}</g:link>
${imageLink ? `<g:image_link>${escapeXml(imageLink)}</g:image_link>` : ""}
<g:price>${price}</g:price>
<g:condition>new</g:condition>
<g:availability>${availability}</g:availability>
${product.category ? `<g:product_type>${escapeXml(product.category)}</g:product_type>` : ""}
</item>
`;
    });

    xml += `</channel>
</rss>`;

    return xml;
}

export async function GET() {
    try {
        console.log("🚀 Generating Google Merchant Center XML feed...");

        // Fetch active products
        const products = await fetchActiveProducts();

        if (products.length === 0) {
            console.warn("⚠️ No products found for the Google catalog");
            // Return empty but valid XML
            const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
<title>Luxe Store</title>
<link>https://store.idmisk.com</link>
<description>Luxe Store - Premium Products Catalog</description>
</channel>
</rss>`;

            return new NextResponse(emptyXml, {
                status: 200,
                headers: {
                    "Content-Type": "text/xml; charset=utf-8",
                    "Cache-Control": "public, max-age=3600, s-maxage=3600",
                },
            });
        }

        // Generate XML
        const xml = generateXML(products);

        console.log(`✅ Generated XML feed with ${products.length} products`);

        return new NextResponse(xml, {
            status: 200,
            headers: {
                "Content-Type": "text/xml; charset=utf-8",
                "Cache-Control": "public, max-age=3600, s-maxage=3600",
            },
        });

    } catch (error) {
        console.error("🔥 Error generating Google catalog:", error);

        // Return error response with proper XML content type
        const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
<title>Error</title>
<description>Error generating catalog</description>
</channel>
</rss>`;

        return new NextResponse(errorXml, {
            status: 500,
            headers: {
                "Content-Type": "text/xml; charset=utf-8",
            },
        });
    }
}
