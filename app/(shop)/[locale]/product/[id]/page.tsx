"use client";

import { useParams } from "next/navigation";
import { useShop } from "@/context/ShopContext";
import { useTranslations, useLocale } from "next-intl";
import { ShoppingCart, Heart, Star, Package, ArrowLeft, ChevronDown, Truck, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import CheckoutForm from "@/components/shop/CheckoutForm";
import StickyMobileCTA from "@/components/shop/StickyMobileCTA";
import ProductFOMO from "@/components/shop/ProductFOMO";

export default function ProductDetailPage() {
    const params = useParams();
    const { products, addToCart, settings, openCart, openCheckout } = useShop();
    const locale = useLocale();
    const t = useTranslations('Product');
    const tCommon = useTranslations('Common');
    const productId = params.id as string;

    // Variant & Qty State
    const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);

    // Find the product
    const product = products.find(p => p.id === productId);

    // Get product title with translation fallback
    let displayTitle = "Product";
    if (product?.title) {
        if (typeof product.title === 'object' && product.title !== null) {
            displayTitle = (product.title as any)[locale] || (product.title as any)['ar'] || (product.title as any)['en'] || (product.title as any)['fr'] || "Product";
        } else {
            displayTitle = String(product.title);
        }
    }

    // Get description with translation fallback
    let displayDescription = product?.description || "";
    if (product?.description && typeof product.description === 'object') {
        displayDescription = (product.description as any)[locale] || (product.description as any)['ar'] || "";
    }

    // 📊 PIXEL TRACKING: ViewContent
    useEffect(() => {
        if (product) {
            const price = Number(product.price);
            // @ts-ignore
            if (window.fbq) window.fbq('track', 'ViewContent', { content_name: displayTitle, content_ids: [product.id], content_type: 'product', value: price, currency: 'MAD' });
            // @ts-ignore
            if (window.ttq) window.ttq.track('ViewContent', { content_id: product.id, content_type: 'product', content_name: displayTitle, value: price, currency: 'MAD' });
        }
    }, [product, displayTitle]);

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
                    <Link href={`/${locale}`} className="text-emerald-600 hover:underline">Return to Home</Link>
                </div>
            </div>
        );
    }

    const images = product.images && product.images.length > 0 ? product.images : [product.image];
    const showDiscount = product.discountLabel && product.discountLabel.trim() !== "";
    const isRemote = (src: string) => src?.startsWith('http') && !src?.startsWith('data:');

    // Validation
    const validateSelection = () => {
        if (product.variants && product.variants.length > 0 && !selectedVariant) {
            // Toast error
            // We can import toast from sonner or just use alert for now if sonner isn't top-level imported
            // But we should use the one from context or import it.
            // Let's assume toast is available via import "sonner"
            return false;
        }
        return true;
    };

    const handleAddToCart = (openDrawer = true) => {
        if (product.variants && product.variants.length > 0 && !selectedVariant) {
            alert(locale === 'ar' ? 'المرجو اختيار المقاس' : 'Please select a variant');
            return;
        }
        addToCart(product, selectedVariant || undefined, quantity);
        if (openDrawer) openCart();
    };

    const handleBuyNow = () => {
        if (product.variants && product.variants.length > 0 && !selectedVariant) {
            alert(locale === 'ar' ? 'المرجو اختيار المقاس' : 'Please select a variant');
            return;
        }
        addToCart(product, selectedVariant || undefined, quantity);
        openCheckout();
    };

    return (
        <>
            <div className="min-h-screen bg-white md:bg-gray-50 py-4 md:py-8">
                <div className="container mx-auto px-4 max-w-6xl">
                    <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 mb-6 transition">
                        <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
                        <span>Back to Shop</span>
                    </Link>

                    <div className="grid md:grid-cols-2 gap-8 md:gap-12 bg-white rounded-3xl p-0 md:p-8 shadow-none md:shadow-sm">

                        {/* LEFT: Images */}
                        <div className="space-y-4">
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
                            {images.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {images.map((img, idx) => (
                                        <button key={idx} onClick={() => setSelectedImage(idx)} className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition ${selectedImage === idx ? 'border-emerald-600' : 'border-gray-200'}`}>
                                            <Image src={img} alt="" fill className="object-cover" unoptimized={!isRemote(img)} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* RIGHT: Info */}
                        <div className="space-y-6">
                            <div className="border-b pb-4">
                                <h1 className="text-2xl md:text-4xl font-black text-gray-900 mb-3 leading-tight">{displayTitle}</h1>
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
                            </div>
                            {product.stock !== undefined && (
                                <div className="text-sm mt-2 mb-4">
                                    {product.stock > 0 ? <span className="text-green-600 font-bold">✓ In Stock</span> : <span className="text-red-600 font-bold">✗ Out of Stock</span>}
                                </div>
                            )}
                        </div>

                        {/* FOMO Cues */}
                        <ProductFOMO stock={product.stock} />

                        {/* MOVED DESCRIPTION HERE */}
                        {displayDescription && (
                            <div className="text-gray-600 leading-relaxed text-sm">
                                {displayDescription}
                            </div>
                        )}

                        {/* VARIANTS */}
                        {product.variants && product.variants.length > 0 && (
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    {locale === 'ar' ? 'اختر المقاس / النوع:' : 'Select Variant:'}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {product.variants.map((v) => (
                                        <button
                                            key={v}
                                            onClick={() => setSelectedVariant(v)}
                                            className={`px-4 py-2 rounded-lg border-2 text-sm font-bold transition-all ${selectedVariant === v
                                                ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                                }`}
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* QUANTITY SELECTOR */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">
                                {locale === 'ar' ? 'الكمية:' : 'Quantity:'}
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden w-32">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition font-bold text-lg text-gray-600"
                                    >-</button>
                                    <div className="flex-1 h-10 flex items-center justify-center font-bold text-gray-900 bg-white border-x border-gray-100">
                                        {quantity}
                                    </div>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition font-bold text-lg text-gray-600"
                                    >+</button>
                                </div>
                            </div>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="flex flex-col sm:flex-row gap-4 w-full pt-2">
                            <button
                                onClick={handleBuyNow}
                                className="flex-1 bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-black shadow-xl shadow-gray-200 active:scale-[0.98] transition flex items-center justify-center gap-2"
                            >
                                <span>{t('buy_now') || "Buy Now"}</span>
                                {/* Subtext Removed as requested */}
                            </button>

                            <button
                                onClick={() => handleAddToCart(true)}
                                className="flex-1 bg-white border-2 border-gray-200 text-gray-900 py-4 rounded-xl font-bold text-lg hover:border-black hover:bg-gray-50 active:scale-[0.98] transition flex items-center justify-center gap-2"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                <span>{t('add_to_cart') || "Add to Cart"}</span>
                            </button>
                        </div>

                        {/* Delivery Info */}
                        <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 flex items-start gap-3 border border-gray-100 mt-4">
                            <Truck className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
                            <div>
                                <p className="font-bold mb-1 text-gray-900">Shipping & Delivery</p>
                                <p className="opacity-90">{settings.shippingMode === 'free' ? "Free Shipping" : "Fast Delivery"}</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            {/* Sticky Mobile CTA */}
            <StickyMobileCTA product={product} onBuyNow={handleBuyNow} />
        </>
    );
}
