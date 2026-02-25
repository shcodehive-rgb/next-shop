import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getStoreData } from "@/lib/server/getStoreData";
import { CITIES, INTENTS, BASE_URL, parseExploreSlug, buildExploreSlug } from "@/lib/seo-config";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

interface Props {
    params: Promise<{ slug: string }>;
}

// ── Static params: pre-render all city × category × intent combos ─────────────
export async function generateStaticParams() {
    try {
        const { categories } = await getStoreData();
        const params: { slug: string }[] = [];
        for (const intent of INTENTS) {
            for (const cat of categories) {
                for (const city of CITIES) {
                    params.push({ slug: buildExploreSlug(intent.slug, cat.id, city.slug) });
                }
            }
        }
        return params;
    } catch {
        return [];
    }
}

// ── Dynamic metadata ──────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const parsed = parseExploreSlug(slug);
    if (!parsed) return { title: "Idmisk Store" };

    const { intent, categorySlug, city } = parsed;

    // Fetch category name from store
    let categoryAr = categorySlug;
    try {
        const { categories } = await getStoreData();
        const cat = categories.find((c) => c.id === categorySlug);
        if (cat) {
            categoryAr = typeof cat.name === "string"
                ? cat.name
                : (cat.name as any)?.ar || categorySlug;
        }
    } catch { /* use raw slug */ }

    const title = `${intent.ar} ${categoryAr} في ${city.ar} | توصيل سريع - الدفع عند الاستلام`;
    const description = `اشتري أفضل ${categoryAr} في ${city.ar} بضمان الجودة. توصيل سريع لجميع أحياء ${city.ar}. الدفع عند الاستلام. متجر إدمسك.`;
    const pageUrl = `${BASE_URL}/explore/${slug}`;

    return {
        title,
        description,
        alternates: { canonical: pageUrl },
        openGraph: {
            title,
            description,
            url: pageUrl,
            siteName: "Idmisk Store",
            locale: "ar_MA",
            type: "website",
        },
        robots: { index: true, follow: true },
    };
}

// ── Page component ────────────────────────────────────────────────────────────
export default async function ExplorePage({ params }: Props) {
    const { slug } = await params;
    const parsed = parseExploreSlug(slug);
    if (!parsed) return notFound();

    const { intent, categorySlug, city } = parsed;

    // Fetch products for this category
    let categoryName = categorySlug;
    let products: any[] = [];

    try {
        const { products: allProducts, categories } = await getStoreData();

        const cat = categories.find((c) => c.id === categorySlug);
        if (cat) {
            categoryName = typeof cat.name === "string"
                ? cat.name
                : (cat.name as any)?.ar || categorySlug;
        }

        products = allProducts
            .filter((p) => p.category === categorySlug && p.visible !== false)
            .slice(0, 4);
    } catch { /* show page without products */ }

    const pageTitle = `${intent.ar} ${categoryName} في ${city.ar}`;

    return (
        <div className="min-h-screen bg-white" dir="rtl">
            {/* ── Hero band ── */}
            <div className="bg-gradient-to-b from-emerald-50 to-white pt-16 pb-10 px-4 text-center">
                <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full mb-4 tracking-wide">
                    📍 {city.ar}
                </span>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
                    {pageTitle}
                </h1>
                <p className="text-gray-500 text-base max-w-lg mx-auto leading-relaxed">
                    اكتشف أفضل {categoryName} بتوصيل سريع لجميع أحياء {city.ar}.
                    الدفع عند الاستلام — لا حاجة لبطاقة بنكية.
                </p>
                {/* Trust badges */}
                <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1.5"><span>🚚</span> توصيل سريع</span>
                    <span className="flex items-center gap-1.5"><span>💳</span> الدفع عند الاستلام</span>
                    <span className="flex items-center gap-1.5"><span>✅</span> ضمان الجودة</span>
                </div>
            </div>

            {/* ── Products ── */}
            <div className="container mx-auto px-4 py-10 max-w-5xl">
                {products.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                        {products.map((product) => {
                            const title = typeof product.title === "string"
                                ? product.title
                                : (product.title as any)?.ar || "منتج";
                            const image = product.images?.[0] || product.image || "/placeholder.jpg";

                            return (
                                <Link
                                    key={product.id}
                                    href={`/ar/product/${product.id}`}
                                    className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
                                >
                                    <div className="aspect-square bg-gray-50 overflow-hidden">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={image}
                                            alt={title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <div className="p-3 flex flex-col flex-1">
                                        <p className="text-sm font-bold text-gray-800 line-clamp-2 flex-1 text-right">
                                            {title}
                                        </p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-base font-black text-emerald-600">
                                                {product.price} DH
                                            </span>
                                            {product.originalPrice && (
                                                <span className="text-xs text-gray-400 line-through">
                                                    {product.originalPrice} DH
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-center text-gray-400 py-10">
                        لا توجد منتجات متاحة حالياً في هذه الفئة.
                    </p>
                )}

                {/* ── Sticky Buy Now CTA ── */}
                <div className="sticky bottom-6 mt-10 flex justify-center z-40">
                    <Link
                        href={`/ar/collection/${categorySlug}`}
                        className="inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base px-10 py-4 rounded-full shadow-2xl shadow-emerald-200 hover:shadow-emerald-300 transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                    >
                        <span>تسوق الآن في {city.ar}</span>
                        <span>←</span>
                    </Link>
                </div>
            </div>

            {/* ── Local SEO text block ── */}
            <div className="bg-gray-50 border-t border-gray-100 py-12 px-4">
                <div className="max-w-2xl mx-auto text-right">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">
                        {categoryName} في {city.ar} — متجر إدمسك
                    </h2>
                    <p className="text-gray-500 text-sm leading-7">
                        يوفر متجر إدمسك أفضل {categoryName} بأسعار تنافسية مع توصيل سريع
                        لجميع أحياء {city.ar} وضواحيها. اطلب الآن واستمتع بخدمة الدفع عند
                        الاستلام دون أي رسوم إضافية. تسوق بأمان وثقة.
                    </p>
                </div>
            </div>
        </div>
    );
}
