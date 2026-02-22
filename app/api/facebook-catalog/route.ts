import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { unstable_cache } from "next/cache";

// Cache for 1 hour to improve performance
export const revalidate = 3600;

interface Product {
    id: string;
    title: string | { ar: string; en: string; fr: string };
    price: string;
    image: string;
    images?: string[];
    description?: string;
    stock?: number;
    category: string;
    visible?: boolean;
}

// Helper function to escape XML special characters
function escapeXml(unsafe: string): string {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// Helper function to get title in preferred language
function getTitle(title: string | { ar: string; en: string; fr: string }): string {
    if (typeof title === "string") return title;
    return title.en || title.ar || title.fr || "Product";
}

// Helper function to get primary image
function getPrimaryImage(product: Product): string {
    // Use first image from images array if available
    if (product.images && product.images.length > 0) {
        return product.images[0];
    }
    // Fallback to single image field
    return product.image || "";
}

// Helper function to format price
function formatPrice(price: string): string {
    // Remove any currency symbols and extra whitespace, then add MAD
    const cleanPrice = price.replace(/[^0-9.]/g, "").trim();
    return cleanPrice ? `${cleanPrice} MAD` : "0 MAD";
}

// Fetch active products from Firestore
async function fetchActiveProducts(): Promise<Product[]> {
    try {
        const productsQuery = query(
            collection(db, "products"),
            where("visible", "in", [true, undefined]), // Include products where visible is true or undefined
            limit(1000) // Limit to 1000 products for performance
        );

        const querySnapshot = await getDocs(productsQuery);
        const products: Product[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            // Only include products that have basic required fields
            if (data.title && data.price && (data.image || data.images)) {
                products.push({
                    id: doc.id,
                    title: data.title,
                    price: data.price,
                    image: data.image,
                    images: data.images,
                    description: data.description,
                    stock: data.stock,
                    category: data.category,
                    visible: data.visible
                } as Product);
            }
        });

        console.log(`✅ Fetched ${products.length} active products for Facebook catalog`);
        return products;
    } catch (error) {
        console.error("🔥 Error fetching products for Facebook catalog:", error);
        return [];
    }
}

// Generate XML for Facebook Commerce Manager
function generateXML(products: Product[]): string {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3001";
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>Product Catalog</title>
<link>${baseUrl}</link>
<description>Product catalog for Facebook & Instagram Shopping</description>
`;

    products.forEach((product) => {
        const title = getTitle(product.title);
        const description = product.description 
            ? escapeXml(product.description.substring(0, 5000)) // Limit description length
            : escapeXml(title); // Use title as fallback description
        const link = `${baseUrl}/product/${product.id}`;
        const imageLink = getPrimaryImage(product);
        const price = formatPrice(product.price);
        const availability = (product.stock && product.stock > 0) ? "in stock" : "out of stock";

        xml += `<item>
<g:id>${escapeXml(product.id)}</g:id>
<g:title>${escapeXml(title)}</g:title>
<g:description>${description}</g:description>
<g:link>${escapeXml(link)}</g:link>
<g:image_link>${escapeXml(imageLink)}</g:image_link>
<g:price>${price}</g:price>
<g:availability>${availability}</g:availability>
<g:condition>new</g:condition>
<g:product_type>${escapeXml(product.category || "General")}</g:product_type>
</item>
`;
    });

    xml += `</channel>
</rss>`;

    return xml;
}

// Cached function to get products
const getCatalogProducts = unstable_cache(
    async () => fetchActiveProducts(),
    ["facebook-catalog-products"],
    { revalidate: 3600, tags: ["facebook-catalog"] }
);

export async function GET() {
    try {
        console.log("🚀 Generating Facebook catalog XML feed...");
        
        // Fetch active products
        const products = await getCatalogProducts();
        
        if (products.length === 0) {
            console.warn("⚠️ No products found for catalog");
            // Return empty but valid XML
            const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>Product Catalog</title>
<link>${process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3001"}</link>
<description>Product catalog for Facebook & Instagram Shopping</description>
</channel>
</rss>`;
            
            return new NextResponse(emptyXml, {
                status: 200,
                headers: {
                    "Content-Type": "application/xml; charset=utf-8",
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
                "Content-Type": "application/xml; charset=utf-8",
                "Cache-Control": "public, max-age=3600, s-maxage=3600",
            },
        });

    } catch (error) {
        console.error("🔥 Error generating Facebook catalog:", error);
        
        // Return error response with proper XML content type
        const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>Error</title>
<description>Error generating catalog</description>
</channel>
</rss>`;
        
        return new NextResponse(errorXml, {
            status: 500,
            headers: {
                "Content-Type": "application/xml; charset=utf-8",
            },
        });
    }
}
