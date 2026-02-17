
import { getProduct } from "@/lib/server/getStoreData";
import ProductClient from "@/components/shop/ProductClient";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

type Props = {
    params: Promise<{ id: string; locale: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// 1. Dynamic Metadata Generation for SEO
export async function generateMetadata(
    props: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const params = await props.params;
    const product = await getProduct(params.id);

    if (!product) {
        return {
            title: 'Product Not Found',
        };
    }

    // Use SEO fields if available, otherwise fallback
    const title = product.metaTitle || (typeof product.title === 'string' ? product.title : (product.title as any)[params.locale] || "Product");
    const description = product.metaDescription || (typeof product.description === 'string' ? product.description : (product.description as any)[params.locale] || "Product details");

    // Images
    const previousImages = (await parent).openGraph?.images || [];
    const productImages = product.images || (product.image ? [product.image] : []);

    return {
        title: title,
        description: description.substring(0, 160), // standard SEO limit
        openGraph: {
            title: title,
            description: description,
            images: [...productImages, ...previousImages],
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
            images: productImages,
        },
    };
}

// 2. Server Component
export default async function ProductPage(props: Props) {
    const params = await props.params;
    const product = await getProduct(params.id);

    if (!product) {
        notFound();
    }

    // 3. JSON-LD Structured Data (Rich Snippets)
    const headersList = await headers();
    const host = headersList.get('host');

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: typeof product.title === 'string' ? product.title : (product.title as any)[params.locale],
        image: product.images || [product.image],
        description: product.metaDescription || (typeof product.description === 'string' ? product.description : (product.description as any)[params.locale]),
        sku: product.id,
        offers: {
            '@type': 'Offer',
            url: `https://${host}/${params.locale}/product/${product.id}`,
            priceCurrency: 'MAD',
            price: product.price,
            itemCondition: 'https://schema.org/NewCondition',
            availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        },
    };

    return (
        <>
            {/* Inject JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Render Client Component */}
            <ProductClient initialProduct={product} />
        </>
    );
}
