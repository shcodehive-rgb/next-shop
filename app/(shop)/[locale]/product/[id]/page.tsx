
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
        return { title: 'Product Not Found' };
    }

    const BASE_URL = 'https://store.idmisk.com';
    const locale = params.locale;

    // Title & description
    const title = product.metaTitle
        || (typeof product.title === 'string' ? product.title : (product.title as any)?.[locale] || 'Product');
    const rawDesc = product.metaDescription
        || (typeof product.description === 'string' ? product.description : (product.description as any)?.[locale] || '');
    const description = rawDesc.substring(0, 160);

    // Primary image — must be absolute URL for Facebook
    const productImages: string[] = product.images?.length
        ? product.images
        : product.image ? [product.image] : [];

    const toAbsolute = (url: string) =>
        url.startsWith('http') ? url : `${BASE_URL}${url}`;

    // OG image objects with explicit dimensions (Facebook needs these)
    const ogImages = productImages.slice(0, 3).map((url: string) => ({
        url: toAbsolute(url),
        width: 1200,
        height: 630,
        alt: title,
    }));

    const productUrl = `${BASE_URL}/${locale}/product/${product.id}`;

    return {
        title,
        description,
        openGraph: {
            type: 'website',
            url: productUrl,
            title,
            description,
            images: ogImages,
            siteName: 'Idmisk Store',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: productImages.slice(0, 1).map(toAbsolute),
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
