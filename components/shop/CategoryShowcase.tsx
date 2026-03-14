"use client";

import Link from "next/link";
import { MoveRight, MoveLeft } from "lucide-react";
import { useLocale } from "next-intl";
import { useShop, Product, Category } from "@/context/ShopContext";
import ProductCard from "@/components/shop/ProductCard";
import { toast } from "sonner";

interface Props {
    products: Product[];
    categories: Category[];
}

function getCatName(name: any, locale: string): string {
    if (typeof name === "string") return name;
    return name?.[locale] || name?.ar || name?.en || name?.fr || "Category";
}

export default function CategoryShowcase({ products, categories }: Props) {
    const locale = useLocale();
    const isRTL = locale === "ar";
    const { addToCart, openCart } = useShop();

    return (
        <div className="space-y-16">
            {categories.map((category) => {
                // Fuzzy match: product.category may be stored as an ID *or* as a name string
                const matches = (p: Product) => {
                    const pCat = (p.category || "").trim().toLowerCase();
                    if (!pCat) return false;

                    const id = (category.id || "").toLowerCase();
                    const nameAr = typeof category.name === "string"
                        ? category.name.toLowerCase()
                        : ((category.name as any)?.ar || "").toLowerCase();
                    const nameEn = typeof category.name === "string"
                        ? category.name.toLowerCase()
                        : ((category.name as any)?.en || "").toLowerCase();
                    const nameFr = typeof category.name === "string"
                        ? ""
                        : ((category.name as any)?.fr || "").toLowerCase();

                    return (
                        pCat === id ||
                        pCat === nameAr ||
                        pCat === nameEn ||
                        pCat === nameFr
                    );
                };

                const catProducts = products
                    .filter((p) => matches(p) && p.visible !== false)
                    .slice(0, 4);


                if (catProducts.length === 0) return null;

                const name = getCatName(category.name, locale);

                return (
                    <section key={category.id} className="py-2">
                        <div className="container mx-auto px-4">
                            {/* ── Section Header ── */}
                            <div className="flex items-end justify-between mb-6">
                                <div>
                                    {/* Thin accent line */}
                                    <div className="w-8 h-[2px] bg-emerald-500 mb-2" />
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                                        {name}
                                    </h2>
                                </div>

                                {/* Elegant View More */}
                                <Link
                                    href={`/${locale}/shop?category=${category.id}`}
                                    className="group inline-flex items-center gap-2 text-sm font-light tracking-widest text-emerald-700 uppercase border-b border-emerald-300 pb-0.5 hover:border-emerald-600 hover:text-emerald-800 transition-all duration-300"
                                >
                                    <span>{isRTL ? "رؤية المزيد" : "View More"}</span>
                                    {isRTL ? (
                                        <MoveLeft className="w-3.5 h-3.5 stroke-[1.25] transition-transform duration-300 group-hover:-translate-x-0.5" />
                                    ) : (
                                        <MoveRight className="w-3.5 h-3.5 stroke-[1.25] transition-transform duration-300 group-hover:translate-x-0.5" />
                                    )}
                                </Link>
                            </div>

                            {/* ── Product Grid ── */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {catProducts.map((product, index) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                    />
                                ))}
                            </div>

                            {/* ── Centered View More (below grid, full button) ── */}
                            <div className="flex justify-center mt-12">
                                <Link
                                    href={`/${locale}/collections/all`}
                                    className="group inline-flex items-center gap-3 px-12 py-4 border border-black text-black font-light tracking-widest text-sm uppercase rounded-none hover:bg-black hover:text-white transition-all duration-500 hover:shadow-xl active:scale-95"
                                >
                                    <span>{isRTL ? "رؤية المزيد" : "View More"}</span>
                                    {isRTL ? (
                                        <MoveLeft className="w-4 h-4 stroke-[1.25] transition-transform duration-500 group-hover:-translate-x-1" />
                                    ) : (
                                        <MoveRight className="w-4 h-4 stroke-[1.25] transition-transform duration-500 group-hover:translate-x-1" />
                                    )}
                                </Link>
                            </div>
                        </div>
                    </section>
                );
            })}
        </div>
    );
}
