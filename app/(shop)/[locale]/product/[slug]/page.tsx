import { getProduct, getStoreData } from "@/lib/server/getStoreData";
import ProductPageClient from "@/components/shop/ProductPageClient";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

interface Product {
    id: string;
    title: string | { ar: string; en: string; fr: string };
    price: string;
    description?: string;
    metaDescription?: string;
    metaTitle?: string;
    images?: string[];
    videoUrl?: string;
    variants?: any;
    bundles?: any;
    stock?: string;
    isBestSeller?: boolean;
    allowAddToCart?: boolean;
    howToUse?: string;
    ingredients?: string;
    richContentImages?: string[];
    technicalSpecifications?: { key: string; value: string }[];
    discountLabel?: string;
}

type Props = {
    params: Promise<{ slug: string; locale: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// 1. Dynamic Metadata Generation for SEO
export async function generateMetadata(
    { params, searchParams }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const product = await getProduct(resolvedParams.slug);

    if (!product) {
        return { title: 'Product Not Found' };
    }

    const locale = resolvedParams.locale;

    // Handle title parsing with proper fallbacks
    let title = 'Product';
    if (product && product.title) {
        if (typeof product.title === 'string') {
            title = product.title;
        } else if (typeof product.title === 'object') {
            const titleObj = product.title as any;
            const fallbackTitle = titleObj.en || titleObj.fr || Object.values(titleObj)[0] || 'Product';
            title = titleObj[locale] || fallbackTitle;
        }
    }

    const rawDesc = product.metaDescription
        ? product.metaDescription
        : (typeof product.description === 'string' ? product.description : (product.description as any)[locale] || '');

    const description = rawDesc.substring(0, 160);

    // 2. Product Images for SEO
    const productImages: string[] = product.images?.length > 0
        ? product.images
        : product.image ? [product.image] : [];

    // 3. OpenGraph objects for Facebook
    const ogImages = productImages.slice(0, 10).map((url: string) => ({
        url: url.startsWith('http') ? url : `https://store.idmisk.com${url}`,
        width: 1200,
        height: 630,
        alt: title,
    }));

    // 4. Structured Data for Rich Snippets
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: typeof product.title === 'string' ? product.title : (product.title as any)[locale] || 'Product',
        image: product.images || [product.image],
        description: description,
        sku: product.id,
        offers: {
            '@type': 'Offer',
            url: `https://store.idmisk.com/${resolvedParams.locale}/product/${product.id}`,
            priceCurrency: 'MAD',
            price: product.price,
            itemCondition: 'https://schema.org/NewCondition',
            availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        },
    };

    return {
        title,
        description,
        openGraph: {
            type: 'website',
            url: `https://store.idmisk.com/${resolvedParams.locale}/product/${product.id}`,
            title,
            description,
            images: ogImages,
            siteName: 'Idmisk Store',
        },
        alternates: {
            canonical: `https://store.idmisk.com/${resolvedParams.locale}/product/${product.id}`,
        },
    };
}

// 2. Server Component
export default async function ProductPage(props: Props) {
    const params = await props.params;
    const product = await getProduct(params.slug);
    const { products } = await getStoreData();

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

    const title = typeof product.title === 'string' ? product.title : (product.title as any)[params.locale] || 'Product';
    const description = product.metaDescription || (typeof product.description === 'string' ? product.description : (product.description as any)[params.locale]);

    return (
        <div className="min-h-screen bg-white" dir={params.locale === "ar" ? "rtl" : "ltr"}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ProductPageClient
                product={product}
                allProducts={products}
                locale={params.locale}
                title={title}
                description={description}
            />
        </div>
    );
}
