"use client";

import { useShop } from "@/context/ShopContext";
import { useTranslations, useLocale } from "next-intl";
import { ArrowRight, Star, ShoppingBag, Truck, ShieldCheck, ArrowLeft, Heart, Share2, FileText, Package } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import CheckoutForm from "@/components/shop/CheckoutForm";
import ProductFOMO from "@/components/shop/ProductFOMO";

interface ProductClientProps {
    initialProduct: any; // Passed from Server
}

export default function ProductClient({ initialProduct }: ProductClientProps) {
    const { addToCart, settings, openCart } = useShop();
    const locale = useLocale();
    const t = useTranslations('Product');
    const tCommon = useTranslations('Common');

    // We use the passed product as initial state, but we might want to ensure it matches 
    // what's in the global context if we want real-time updates (stock etc).
    // For SEO purposes, initialProduct is key. For interactivity, we can use it directly.
    const product = initialProduct;

    // Variant & Qty State
    const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);

    // Bundle State
    const [selectedBundleIndex, setSelectedBundleIndex] = useState<number | null>(null);

    // Initialize quantity from bundle if selected
    useEffect(() => {
        if (selectedBundleIndex !== null && product?.bundles && product.bundles[selectedBundleIndex]) {
            setQuantity(product.bundles[selectedBundleIndex].qty);
        }
    }, [selectedBundleIndex, product]);

    // Reset bundle if quantity changes manually
    useEffect(() => {
        if (selectedBundleIndex !== null && product?.bundles && product.bundles[selectedBundleIndex]) {
            if (quantity !== product.bundles[selectedBundleIndex].qty) {
                setSelectedBundleIndex(null);
            }
        }
    }, [quantity]);

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

    const images = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);
    const showDiscount = product.discountLabel && product.discountLabel.trim() !== "";
    const isRemote = (src: string) => src?.startsWith('http') && !src?.startsWith('data:');

    const getActivePrice = () => {
        if (selectedBundleIndex !== null && product.bundles && product.bundles[selectedBundleIndex]) {
            const bundle = product.bundles[selectedBundleIndex];
            return bundle.price / bundle.qty;
        }
        return Number(product.price);
    };

    const handleAddToCart = (openDrawer = true) => {
        if (product.variants && product.variants.length > 0 && !selectedVariant) {
            alert(locale === 'ar' ? 'المرجو اختيار المقاس' : 'Please select a variant');
            return;
        }

        const effectivePrice = getActivePrice();
        const productToAdd = { ...product, price: String(effectivePrice) };

        addToCart(productToAdd, selectedVariant || undefined, quantity);
        if (openDrawer) openCart();
    };


    return (
        <div className="min-h-screen bg-white md:bg-gray-50 py-4 md:py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 mb-6 transition">
                    <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
                    <span>{locale === 'ar' ? 'العودة للمتجر' : 'Back to Shop'}</span>
                </Link>

                <div className="grid md:grid-cols-2 gap-8 md:gap-12 bg-white rounded-3xl p-0 md:p-8 shadow-none md:shadow-sm">

                    {/* LEFT: Images */}
                    <div className="space-y-4">
                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm">
                            <Image
                                src={images[selectedImage] || "/placeholder.svg"}
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
                                {images.map((img: string, idx: number) => (
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
                            <h1 className="text-2xl md:text-4xl font-black text-gray-900 mb-3 leading-tight font-tajawal">{displayTitle}</h1>
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

                            {/* SCARCITY TRIGGER (CRO) */}
                            {(product.stock && product.stock < 10) && (
                                <div className="inline-block bg-red-50 text-red-600 px-3 py-1 rounded-lg text-sm font-bold animate-pulse mb-2 border border-red-100">
                                    🔥 {locale === 'ar' ? `سارع بالطلب! تبقى ${product.stock} فقط` : `Hurry! Only ${product.stock} left in stock`}
                                </div>
                            )}

                        </div>

                        {/* HIGHLIGHTS */}
                        {product.highlights ? (
                            <ul className="space-y-2 mb-6 font-tajawal">
                                {product.highlights.split('\n').slice(0, 3).map((line: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-gray-700">
                                        <div className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                        <span className="font-bold text-sm leading-relaxed">{line}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            displayDescription && (
                                <div className="text-gray-600 leading-relaxed text-sm mb-6 line-clamp-3 font-tajawal">
                                    {displayDescription}
                                </div>
                            )
                        )}

                        {/* FOMO Cues */}
                        <ProductFOMO stock={product.stock} />

                        {/* VARIANTS */}
                        {product.variants && product.variants.length > 0 && (
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    {locale === 'ar' ? 'اختر المقاس / النوع:' : 'Select Variant:'}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {product.variants.map((v: string) => (
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

                        {/* BUNDLE OFFERS */}
                        {product.bundles && product.bundles.length > 0 && (
                            <div className="mb-6 space-y-3">
                                <label className="block text-sm font-bold text-gray-900">
                                    {locale === 'ar' ? 'عروض التوفير:' : 'Bundle Offers:'}
                                </label>

                                {/* 1. Default Option (Buy 1) */}
                                <div
                                    onClick={() => { setSelectedBundleIndex(null); setQuantity(1); }}
                                    className={`relative p-4 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${selectedBundleIndex === null && quantity === 1
                                        ? 'border-emerald-600 bg-emerald-50 shadow-md'
                                        : 'border-gray-200 bg-white hover:border-emerald-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedBundleIndex === null && quantity === 1 ? 'border-emerald-600' : 'border-gray-300'}`}>
                                            {selectedBundleIndex === null && quantity === 1 && <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />}
                                        </div>
                                        <div>
                                            <span className="font-bold text-gray-900 block">{locale === 'ar' ? 'قطعة واحدة' : 'Buy 1 Piece'}</span>
                                            <span className="text-sm text-gray-500">{product.price} {tCommon('currency')}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Bundle Options */}
                                {product.bundles.map((bundle: any, idx: number) => (
                                    <div
                                        key={idx}
                                        onClick={() => { setSelectedBundleIndex(idx); }}
                                        className={`relative p-4 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${selectedBundleIndex === idx
                                            ? 'border-emerald-600 bg-emerald-50 shadow-md'
                                            : 'border-gray-200 bg-white hover:border-emerald-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedBundleIndex === idx ? 'border-emerald-600' : 'border-gray-300'}`}>
                                                {selectedBundleIndex === idx && <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />}
                                            </div>
                                            <div>
                                                <span className="font-bold text-gray-900 block">
                                                    {locale === 'ar' ? `${bundle.qty} قطع` : `Buy ${bundle.qty} Pieces`}
                                                </span>
                                                <span className="text-sm text-emerald-700 font-bold">
                                                    {bundle.price} {tCommon('currency')}
                                                    <span className="text-gray-400 font-normal text-xs ml-1">
                                                        ({Math.round(bundle.price / bundle.qty)} / {locale === 'ar' ? 'للقطعة' : 'unit'})
                                                    </span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Badge */}
                                        {bundle.badgeText && (
                                            <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg shadow-sm">
                                                {bundle.badgeText}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className={selectedBundleIndex !== null ? "opacity-50 pointer-events-none grayscale" : ""}>
                            <label className="block text-sm font-bold text-gray-900 mb-2">
                                {locale === 'ar' ? 'الكمية (مخصص):' : 'Quantity (Custom):'}
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

                        {/* INLINE CHECKOUT FORM */}
                        <div id="checkout-form-section" className="mt-6 border-t pt-6 animate-in slide-in-from-bottom-4 duration-700">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                {locale === 'ar' ? 'طلب المنتج الان:' : 'Order Now (Cash on Delivery):'}
                            </h3>

                            <CheckoutForm
                                product={product}
                                className="bg-emerald-50/50 border-emerald-100 shadow-sm"
                                directOrder={{
                                    items: [{
                                        ...product,
                                        qty: quantity,
                                        price: getActivePrice(),
                                        selectedVariant: selectedVariant,
                                        selectedOptions: selectedVariant ? { Variant: selectedVariant } : {}
                                    }],
                                    total: getActivePrice() * quantity
                                }}
                                onAddToCart={() => handleAddToCart(true)}
                            />
                        </div>

                        {/* Delivery Info */}
                        <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 flex items-start gap-3 border border-gray-100 mt-4">
                            <Truck className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
                            <div>
                                <p className="font-bold mb-1 text-gray-900">
                                    {locale === 'ar' ? 'الشحن والتوصيل' : 'Shipping & Delivery'}
                                </p>
                                <p className="opacity-90">
                                    {settings.shippingMode === 'free' || true
                                        ? (locale === 'ar' ? "توصيل مجاني لجميع المدن" : "Free Shipping")
                                        : (locale === 'ar' ? "توصيل سريع" : "Fast Delivery")}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div >

            {/* RICH CONTENT SECTION */}
            < div className="bg-gray-50 py-12 border-t border-gray-100" >
                {(displayDescription || product.howToUse || product.ingredients || product.richContentImages?.length > 0 || product.videoUrl) && (
                    <div className="container mx-auto px-4 max-w-4xl space-y-12">

                        {/* 0. Video & Rich Images (Visuals First) */}
                        {(product.richContentImages?.length > 0 || product.videoUrl) && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                {product.richContentImages?.map((img: string, idx: number) => (
                                    <div key={idx} className="w-full relative shadow-sm rounded-2xl overflow-hidden">
                                        <Image
                                            src={img}
                                            alt={`Detail ${idx + 1}`}
                                            width={1200}
                                            height={1600}
                                            className="w-full h-auto object-cover"
                                            unoptimized={true}
                                        />
                                    </div>
                                ))}

                                {product.videoUrl && (
                                    <div className="w-full relative rounded-2xl overflow-hidden shadow-lg border-4 border-emerald-50">
                                        <video
                                            src={product.videoUrl}
                                            controls
                                            playsInline
                                            preload="metadata"
                                            className="w-full h-auto bg-black"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 1. Main Description */}
                        {displayDescription && (
                            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 font-tajawal">
                                <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-emerald-600" />
                                    {tCommon('description') || (locale === 'ar' ? "تفاصيل المنتج" : "Product Details")}
                                </h3>
                                <div className="prose prose-emerald max-w-none text-gray-600 leading-relaxed whitespace-pre-line text-lg">
                                    {displayDescription}
                                </div>
                            </section>
                        )}

                        {/* 2. How to Use */}
                        {product.howToUse && (
                            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 font-tajawal">
                                <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-blue-600" />
                                    {locale === 'ar' ? "طريقة الاستخدام" : "How to Use"}
                                </h3>
                                <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed whitespace-pre-line text-lg">
                                    {product.howToUse}
                                </div>
                            </section>
                        )}

                        {/* 3. Ingredients */}
                        {product.ingredients && (
                            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 font-tajawal">
                                <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                                    <Star className="w-5 h-5 text-purple-600" />
                                    {locale === 'ar' ? "المكونات / المواد" : "Ingredients / Materials"}
                                </h3>
                                <div className="prose prose-purple max-w-none text-gray-600 leading-relaxed whitespace-pre-line text-lg">
                                    {product.ingredients}
                                </div>
                            </section>
                        )}
                    </div>
                )
                }
            </div >
            {/* Sticky Mobile CTA (CRO) */}
            < div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 md:hidden z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex items-center gap-3 animate-in slide-in-from-bottom-full duration-500" >
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-bold uppercase">{locale === 'ar' ? 'السعر' : 'Price'}</span>
                    <span className="text-lg font-black text-emerald-600">{product.price} {tCommon('currency')}</span>
                </div>
                <button
                    onClick={() => {
                        const checkoutSection = document.getElementById('checkout-form-section');
                        if (checkoutSection) {
                            checkoutSection.scrollIntoView({ behavior: 'smooth' });
                        }
                    }}
                    className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg active:scale-95 transition"
                >
                    {locale === 'ar' ? 'اطلب الان' : 'Order Now'}
                </button>
            </div >
        </div >
    );
}
