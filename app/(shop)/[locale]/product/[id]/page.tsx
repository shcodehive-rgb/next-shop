"use client";

import { useParams } from "next/navigation";
import { useShop } from "@/context/ShopContext";
import { useTranslations, useLocale } from "next-intl";
import { ShoppingCart, Heart, Star, Package, ArrowLeft, ChevronDown, Truck, FileText } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import CheckoutForm from "@/components/shop/CheckoutForm";

export default function ProductDetailPage() {
    const params = useParams();
    const { products, addToCart, settings } = useShop();
    const locale = useLocale();
    const t = useTranslations('Product');
    const tCommon = useTranslations('Common');
    const productId = params.id as string;

    const [selectedImage, setSelectedImage] = useState(0);

    // Find the product
    const product = products.find(p => p.id === productId);

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
                    <Link href={`/${locale}`} className="text-emerald-600 hover:underline">
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

    // Get product title with translation fallback
    let displayTitle = "Product";
    if (product.title) {
        if (typeof product.title === 'object' && product.title !== null) {
            displayTitle = (product.title as any)[locale] || (product.title as any)['ar'] || (product.title as any)['en'] || (product.title as any)['fr'] || "Product";
        } else {
            displayTitle = String(product.title);
        }
    }

    // Get description with translation fallback
    let displayDescription = product.description || "";
    if (product.description && typeof product.description === 'object') {
        displayDescription = (product.description as any)[locale] || (product.description as any)['ar'] || "";
    }

    const images = product.images && product.images.length > 0 ? product.images : [product.image];
    const showDiscount = product.discountLabel && product.discountLabel.trim() !== "";

    // Helper to check if remote
    const isRemote = (src: string) => src?.startsWith('http') && !src?.startsWith('data:');

    // Delivery Info
    const deliveryText = settings.shippingMode === 'free'
        ? "Delivery is 100% Free! We usually ship within 24-48 hours."
        : "Shipping costs are calculated based on your city. Select your city in the checkout form to see the rate. Fast delivery within 1-3 days.";

    return (
        <>
            <div className="min-h-screen bg-white md:bg-gray-50 py-4 md:py-8">
                <div className="container mx-auto px-4 max-w-6xl">
                    {/* Back Button */}
                    <Link
                        href={`/${locale}`}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 mb-6 transition"
                    >
                        <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
                        <span>Back to Shop</span>
                    </Link>

                    <div className="grid md:grid-cols-2 gap-8 md:gap-12 bg-white rounded-3xl p-0 md:p-8 shadow-none md:shadow-sm">

                        {/* LEFT COLUMN: Images */}
                        <div className="space-y-4">
                            {/* Main Image */}
                            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm">
                                <Image
                                    src={images[selectedImage] || "/placeholder.png"}
                                    alt={displayTitle}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    priority
                                    unoptimized={!isRemote(images[selectedImage])}
                                />
                                {showDiscount && (
                                    <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold z-10 shadow-md">
                                        {product.discountLabel}
                                    </div>
                                )}
                            </div>

                            {/* Thumbnail Gallery */}
                            {images.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImage(idx)}
                                            className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition ${selectedImage === idx ? 'border-emerald-600' : 'border-gray-200'
                                                }`}
                                        >
                                            <Image
                                                src={img}
                                                alt=""
                                                fill
                                                className="object-cover"
                                                unoptimized={!isRemote(img)}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Desktop: Details / Description (Optional placement) */}
                            <div className="hidden md:block prose prose-sm max-w-none text-gray-600">
                                <h3 className="flex items-center gap-2 font-bold text-gray-900 border-b pb-2 mb-2">
                                    <FileText className="w-4 h-4" /> Description
                                </h3>
                                <p>{displayDescription}</p>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Info & Checkout */}
                        <div className="space-y-6">
                            <div className="border-b pb-6">
                                <h1 className="text-2xl md:text-4xl font-black text-gray-900 mb-3 leading-tight">{displayTitle}</h1>

                                {/* Price */}
                                <div className="flex items-baseline gap-3 mb-2">
                                    <span className="text-3xl md:text-5xl font-black text-emerald-600 tracking-tight">
                                        {product.price} <span className="text-lg font-bold text-gray-500">{tCommon('currency')}</span>
                                    </span>
                                    {product.originalPrice && (
                                        <span className="text-lg text-gray-400 line-through decoration-2">
                                            {product.originalPrice}
                                        </span>
                                    )}
                                </div>
                                {product.stock !== undefined && (
                                    <div className="text-sm">
                                        {product.stock > 0 ? (
                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold text-xs">✓ In Stock</span>
                                        ) : (
                                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold text-xs">✗ Out of Stock</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* EMBEDDED CHECKOUT FORM */}
                            <div className="bg-white rounded-xl">
                                <div className="mb-4">
                                    <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                        <span className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                        Order Now (Cash on Delivery)
                                    </h3>
                                    <p className="text-sm text-gray-500 ml-8">Fill the form to confirm your order instantly.</p>
                                </div>
                                <CheckoutForm product={product} className="shadow-lg border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30" />
                            </div>

                            {/* MOBILE ACCORDIONS */}
                            <div className="md:hidden space-y-2 pt-4">
                                {/* Description Accordion */}
                                <details className="group bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                                    <summary className="flex items-center justify-between p-4 font-bold text-gray-900 cursor-pointer list-none select-none">
                                        <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-gray-500" /> Description</span>
                                        <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
                                    </summary>
                                    <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-2">
                                        {displayDescription}
                                    </div>
                                </details>

                                {/* Delivery Info Accordion */}
                                <details className="group bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                                    <summary className="flex items-center justify-between p-4 font-bold text-gray-900 cursor-pointer list-none select-none">
                                        <span className="flex items-center gap-2"><Truck className="w-4 h-4 text-gray-500" /> Delivery Information</span>
                                        <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
                                    </summary>
                                    <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-2">
                                        {deliveryText}
                                    </div>
                                </details>
                            </div>

                            {/* Desktop Delivery Info */}
                            <div className="hidden md:block bg-blue-50 p-4 rounded-xl text-sm text-blue-800 flex items-start gap-3">
                                <Truck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold mb-1">Shipping & Delivery</p>
                                    <p className="opacity-90">{deliveryText}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
