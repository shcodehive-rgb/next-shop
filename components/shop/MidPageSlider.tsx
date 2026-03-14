"use client";

import Marquee from "react-fast-marquee";
import { useShop, Product } from "@/context/ShopContext";
import { useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";

// ── Slider Card ───────────────────────────────────────────────────────────────
function SliderCard({ product, locale }: { product: Product; locale: string }) {
    const isRemote = (src: string) => src?.startsWith("http") && !src?.startsWith("data:");
    const img = product.images?.[0] || product.image || "/placeholder.svg";
    let title = product.title || "";
    if (typeof title === "object")
        title = (title as any)[locale] || (title as any).ar || (title as any).en || "";
    const price = Number(product.price);

    return (
        <Link
            href={`/${locale}/product/${product.id}`}
            // mx-2 = 8px gap on each side; flex-none locks width
            className="group flex-none w-[160px] sm:w-[185px] md:w-[200px] mx-2 bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        >
            {/* Image */}
            <div className="relative aspect-square w-full bg-gray-50 overflow-hidden">
                <Image
                    src={img}
                    alt={title as string}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    unoptimized={!isRemote(img)}
                />
                {price < 99 && (
                    <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm z-10">
                        منتج إضافي
                    </span>
                )}
            </div>

            {/* Info */}
            <div className="p-3">
                <p className="font-bold text-gray-800 text-sm line-clamp-2 leading-tight mb-2 text-right font-tajawal">
                    {title as string}
                </p>
                <span className="text-emerald-600 font-black text-base block text-right">
                    {price}{" "}
                    <span className="text-xs font-bold text-gray-400">DH</span>
                </span>
            </div>
        </Link>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────
interface MidPageSliderProps {
    products?: Product[];
}

export default function MidPageSlider({ products: propProducts }: MidPageSliderProps) {
    const { products: contextProducts } = useShop();
    const locale = useLocale();
    const isRTL = locale === "ar";

    const allProducts = propProducts || contextProducts;

    // Only products tagged for this slider
    const sliderProducts = allProducts.filter(
        (p) => p.showInMidPageSlider === true && p.visible !== false
    );

    if (sliderProducts.length === 0) return null;

    return (
        <section
            className="py-10 bg-gradient-to-b from-gray-50 to-white"
            aria-label={isRTL ? "منتجات مختارة لك" : "Handpicked For You"}
        >
            <div className="container mx-auto px-4">

                {/* ── Header ── */}
                <div className="mb-6">
                    <h2 className="text-2xl font-black text-gray-900 font-tajawal">
                        🔥 {isRTL ? "منتجات مختارة لك" : "Handpicked For You"}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1 font-tajawal">
                        {isRTL
                            ? "أضفها لسلتك لإتمام طلبك • تتوقف عند التحويم"
                            : "Add them to your cart • Hover to pause"}
                    </p>
                </div>

            </div>

            {/*
              ── react-fast-marquee ─────────────────────────────────────────────
              • direction="right" → items scroll left-to-right visually.
                In RTL, this makes products enter from the LEFT and exit RIGHT,
                which matches native Arabic reading flow.
              • direction="left"  → LTR default (items move right-to-left).
              • pauseOnHover      → stops on mouse-enter for usability.
              • gradient          → subtle fade at edges for a premium feel.
              • speed             → 50 feels natural; raise for faster, lower for slower.
              • The library handles cloning & seamless looping internally — no
                manual duplication needed.
              ─────────────────────────────────────────────────────────────────
            */}
            <Marquee
                direction={isRTL ? "right" : "left"}
                speed={50}
                pauseOnHover
                gradient
                gradientColor="white"
                gradientWidth={60}
                className="py-2"
            >
                {sliderProducts.map((product) => (
                    <SliderCard key={product.id} product={product} locale={locale} />
                ))}
            </Marquee>

        </section>
    );
}
