"use client";

import { useShop } from "@/context/ShopContext";
import { useTranslations, useLocale } from "next-intl";
import {
    ArrowLeft, Star, Truck, ShieldCheck, FileText, Package,
    ChevronDown, X
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import CheckoutForm from "@/components/shop/CheckoutForm";
import ProductFOMO from "@/components/shop/ProductFOMO";
import RecentlyViewed from "@/components/shop/RecentlyViewed";
import { addToRecentlyViewed } from "@/lib/recentlyViewed";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

interface ProductClientProps {
    initialProduct: any;
}

// ─── Mobile Accordion ────────────────────────────────────────────────────────
function Accordion({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition"
            >
                <span className="flex items-center gap-2 font-bold text-gray-800 text-sm">
                    {icon}
                    {title}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
                <div className="px-4 py-4 text-gray-600 text-sm leading-relaxed whitespace-pre-line bg-white font-tajawal">
                    {children}
                </div>
            )}
        </div>
    );
}

// ─── Related Product Card ─────────────────────────────────────────────────────
function RelatedCard({ product, locale }: { product: any; locale: string }) {
    const isRemote = (src: string) => src?.startsWith('http') && !src?.startsWith('data:');
    const img = product.images?.[0] || product.image || "/placeholder.svg";
    let title = product.title || "";
    if (typeof title === 'object') title = title[locale] || title['ar'] || title['en'] || "";

    return (
        <Link
            href={`/${locale}/product/${product.id}`}
            className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
        >
            <div className="relative aspect-square bg-gray-50 overflow-hidden">
                <Image
                    src={img}
                    alt={title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized={!isRemote(img)}
                />
                {product.discountLabel && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        {product.discountLabel}
                    </span>
                )}
            </div>
            <div className="p-3">
                <p className="font-bold text-gray-800 text-sm line-clamp-2 mb-1 font-tajawal">{title}</p>
                <span className="text-emerald-600 font-black text-base">{product.price} <span className="text-xs font-bold text-gray-400">DH</span></span>
            </div>
        </Link>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProductClient({ initialProduct }: ProductClientProps) {
    const { products, addToCart, openCart, cart } = useShop();
    const t = useTranslations('Product');
    const tCommon = useTranslations('Common');
    const locale = useLocale();
    const router = useRouter();

    const product = initialProduct;

    const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [selectedImage, setSelectedImage] = useState<number>(0);
    const [selectedBundleIndex, setSelectedBundleIndex] = useState<number | null>(null);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxImage, setLightboxImage] = useState<string>("");

    useEffect(() => {
        if (selectedBundleIndex !== null && product?.bundles?.[selectedBundleIndex]) {
            setQuantity(product.bundles[selectedBundleIndex].qty);
        }
    }, [selectedBundleIndex, product]);

    // Track product view
    useEffect(() => {
        if (product?.id) {
            addToRecentlyViewed({
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.images?.[0] || product.image
            });
        }
    }, [product]);

    useEffect(() => {
        if (selectedBundleIndex !== null && product?.bundles?.[selectedBundleIndex]) {
            if (quantity !== product.bundles[selectedBundleIndex].qty) {
                setSelectedBundleIndex(null);
            }
        }
    }, [quantity]);

    // Title
    let displayTitle = "Product";
    if (product?.title) {
        displayTitle = typeof product.title === 'object'
            ? (product.title as any)[locale] || (product.title as any)['ar'] || (product.title as any)['en'] || "Product"
            : String(product.title);
    }

    // Description
    let displayDescription = product?.description || "";
    if (product?.description && typeof product.description === 'object') {
        displayDescription = (product.description as any)[locale] || (product.description as any)['ar'] || "";
    }

    // Pixel tracking
    useEffect(() => {
        if (product) {
            const price = Number(product.price);
            // @ts-ignore
            if (window.fbq) window.fbq('track', 'ViewContent', { content_name: displayTitle, content_ids: [product.id], content_type: 'product', value: price, currency: 'MAD' });
            // @ts-ignore
            if (window.ttq) window.ttq.track('ViewContent', { content_id: product.id, content_type: 'product', content_name: displayTitle, value: price, currency: 'MAD' });
        }
    }, [product, displayTitle]);

    const images = product.images?.length > 0 ? product.images : (product.image ? [product.image] : []);
    const showDiscount = product.discountLabel && product.discountLabel.trim() !== "";
    const isRemote = (src: string) => src?.startsWith('http') && !src?.startsWith('data:');

    const getActivePrice = () => {
        if (selectedBundleIndex !== null && product.bundles?.[selectedBundleIndex]) {
            const bundle = product.bundles[selectedBundleIndex];
            return bundle.price / bundle.qty;
        }
        return Number(product.price);
    };

    const handleAddToCart = (openDrawer = true) => {
        if (product.variants?.length > 0 && !selectedVariant) {
            alert(locale === 'ar' ? 'المرجو اختيار المقاس' : 'Please select a variant');
            return;
        }
        const effectivePrice = getActivePrice();
        addToCart({ ...product, price: String(effectivePrice) }, selectedVariant || undefined, quantity);
        if (openDrawer) openCart();
    };

    // Related products logic:
    // - For cheap products (< 99 DH): show other cheap products from same category (cross-sell to hit 149 DH MOV)
    // - For regular products: show same-category products as usual
    const CHEAP_THRESHOLD = 99;
    const isCurrentCheap = Number(product.price) < CHEAP_THRESHOLD;

    const relatedProducts = isCurrentCheap
        ? products
            .filter(p =>
                p.category === product.category &&
                p.id !== product.id &&
                p.visible !== false &&
                Number(p.price) < CHEAP_THRESHOLD
            )
            .slice(0, 4)
        : products
            .filter(p => p.category === product.category && p.id !== product.id && p.visible !== false)
            .slice(0, 4);

    // Rich content sections (description, howToUse, ingredients)
    const hasRichContent = displayDescription || product.howToUse || product.ingredients || product.richContentImages?.length > 0 || product.videoUrl;

    return (
        <div className="min-h-screen bg-white md:bg-gray-50 py-4 md:py-8 pb-24 md:pb-8">
            <div className="container mx-auto px-4 max-w-6xl">

                {/* Back link */}
                <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 mb-6 transition">
                    <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
                    <span>{locale === 'ar' ? 'العودة للمتجر' : 'Back to Shop'}</span>
                </Link>

                {/* ── MAIN GRID ── */}
                <div className="grid md:grid-cols-2 gap-8 md:gap-12 bg-white rounded-3xl p-0 md:p-8 shadow-none md:shadow-sm">

                    {/* LEFT COL: Images ONLY (cleaned for main content) */}
                    <div className="space-y-4">
                        {/* Main image */}
                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm select-none">
                            <Image
                                src={images[selectedImage] || "/placeholder.svg"}
                                alt={displayTitle}
                                fill
                                className="object-contain cursor-pointer select-none"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                priority
                                unoptimized={!isRemote(images[selectedImage])}
                                onContextMenu={(e) => e.preventDefault()}
                                draggable={false}
                                onClick={() => {
                                    setLightboxImage(images[selectedImage]);
                                    setLightboxOpen(true);
                                }}
                            />
                            
                            {/* Watermark Overlay */}
                            <div className="absolute bottom-4 right-4 text-white opacity-40 pointer-events-none select-none font-bold text-sm">
                                Luxe Store
                            </div>
                            
                            {showDiscount && (
                                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold z-10 shadow-md">
                                    {product.discountLabel}
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {images.map((img: string, idx: number) => (
                                    <button key={idx} onClick={() => setSelectedImage(idx)}
                                        className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition select-none ${selectedImage === idx ? 'border-emerald-600' : 'border-gray-200'}`}>
                                        <Image 
                                            src={img} 
                                            alt="" 
                                            fill 
                                            className="object-cover select-none" 
                                            unoptimized={!isRemote(img)}
                                            onContextMenu={(e) => e.preventDefault()}
                                            draggable={false}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* ── RICH MEDIA ONLY (Images & Video) ── */}
                        {(product.richContentImages?.length > 0 || product.videoUrl) && (
                            <div className="space-y-4 mt-2">
                                {product.richContentImages?.map((img: string, idx: number) => (
                                    <div key={idx} className="w-full relative shadow-sm rounded-2xl overflow-hidden select-none">
                                        <Image 
                                            src={img} 
                                            alt={`Detail ${idx + 1}`} 
                                            width={1200} 
                                            height={1600}
                                            className="w-full h-auto object-cover select-none" 
                                            unoptimized 
                                            onContextMenu={(e) => e.preventDefault()}
                                            draggable={false}
                                        />
                                    </div>
                                ))}
                                {product.videoUrl && (
                                    <div className="w-full relative rounded-2xl overflow-hidden shadow-lg border-4 border-emerald-50">
                                        <video src={product.videoUrl} controls playsInline preload="metadata" className="w-full h-auto bg-black" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* RIGHT COL: Product Info */}
                    <div className="space-y-6">
                        <div className="border-b pb-4">
                            <h1 className="text-2xl md:text-4xl font-black text-gray-900 mb-3 leading-tight font-tajawal">{displayTitle}</h1>
                            <div className="flex items-baseline gap-3 mb-2">
                                <span className="text-3xl md:text-5xl font-black text-emerald-600 tracking-tight">
                                    {product.price} <span className="text-lg font-bold text-gray-500">{tCommon('currency')}</span>
                                </span>
                                {product.originalPrice && (
                                    <span className="text-lg text-gray-400 line-through decoration-2">{product.originalPrice}</span>
                                )}
                            </div>
                            {product.stock && product.stock < 10 && (
                                <div className="inline-block bg-red-50 text-red-600 px-3 py-1 rounded-lg text-sm font-bold animate-pulse mb-2 border border-red-100">
                                    🔥 {locale === 'ar' ? `سارع بالطلب! تبقى ${product.stock} فقط` : `Hurry! Only ${product.stock} left`}
                                </div>
                            )}
                        </div>

                        {/* Highlights */}
                        {product.highlights ? (
                            <ul className="space-y-2 font-tajawal">
                                {product.highlights.split('\n').slice(0, 3).map((line: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-gray-700">
                                        <div className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                        <span className="font-bold text-sm leading-relaxed">{line}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            displayDescription && (
                                <div className="text-gray-600 leading-relaxed text-sm mb-2 line-clamp-3 font-tajawal">{displayDescription}</div>
                            )
                        )}


                        {/* FOMO */}
                        <ProductFOMO stock={product.stock} />

                        {/* Variants */}
                        {product.variants?.length > 0 && (
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    {locale === 'ar' ? 'اختر المقاس / النوع:' : 'Select Variant:'}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {product.variants.map((v: string) => (
                                        <button key={v} onClick={() => setSelectedVariant(v)}
                                            className={`px-4 py-2 rounded-lg border-2 text-sm font-bold transition-all ${selectedVariant === v
                                                ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Bundle Offers */}
                        {product.bundles?.length > 0 && (
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-gray-900">
                                    {locale === 'ar' ? 'عروض التوفير:' : 'Bundle Offers:'}
                                </label>
                                {/* Default: Buy 1 */}
                                <div onClick={() => { setSelectedBundleIndex(null); setQuantity(1); }}
                                    className={`relative p-4 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${selectedBundleIndex === null && quantity === 1 ? 'border-emerald-600 bg-emerald-50 shadow-md' : 'border-gray-200 bg-white hover:border-emerald-300'}`}>
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
                                {/* Bundle Options */}
                                {product.bundles.map((bundle: any, idx: number) => (
                                    <div key={idx} onClick={() => setSelectedBundleIndex(idx)}
                                        className={`relative p-4 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${selectedBundleIndex === idx ? 'border-emerald-600 bg-emerald-50 shadow-md' : 'border-gray-200 bg-white hover:border-emerald-300'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedBundleIndex === idx ? 'border-emerald-600' : 'border-gray-300'}`}>
                                                {selectedBundleIndex === idx && <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />}
                                            </div>
                                            <div>
                                                <span className="font-bold text-gray-900 block">{locale === 'ar' ? `${bundle.qty} قطع` : `Buy ${bundle.qty} Pieces`}</span>
                                                <span className="text-sm text-emerald-700 font-bold">
                                                    {bundle.price} {tCommon('currency')}
                                                    <span className="text-gray-400 font-normal text-xs ml-1">
                                                        ({Math.round(bundle.price / bundle.qty)} / {locale === 'ar' ? 'للقطعة' : 'unit'})
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                        {bundle.badgeText && (
                                            <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg shadow-sm">
                                                {bundle.badgeText}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Custom Qty */}
                        <div className={selectedBundleIndex !== null ? "opacity-50 pointer-events-none grayscale" : ""}>
                            <label className="block text-sm font-bold text-gray-900 mb-2">
                                {locale === 'ar' ? 'الكمية (مخصص):' : 'Quantity (Custom):'}
                            </label>
                            <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden w-32">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition font-bold text-lg text-gray-600">-</button>
                                <div className="flex-1 h-10 flex items-center justify-center font-bold text-gray-900 bg-white border-x border-gray-100">{quantity}</div>
                                <button onClick={() => setQuantity(quantity + 1)}
                                    className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition font-bold text-lg text-gray-600">+</button>
                            </div>
                        </div>

                        {/* Inline Checkout Form */}
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
                                        selectedVariant,
                                        selectedOptions: selectedVariant ? { Variant: selectedVariant } : {}
                                    }],
                                    total: getActivePrice() * quantity
                                }}
                                onAddToCart={() => handleAddToCart(true)}
                            />
                        </div>

                        {/* ── NEW ACCORDION (Desktop & Mobile) ── */}
                        <div className="space-y-2">
                            {/* Description Accordion */}
                            <Accordion
                                title={locale === 'ar' ? "الوصف" : "Description"}
                                icon={<FileText className="w-4 h-4 text-emerald-600" />}
                            >
                                <div className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">
                                    {displayDescription}
                                </div>
                            </Accordion>

                            {/* Technical Specifications Accordion */}
                            {product.technicalSpecifications && product.technicalSpecifications.length > 0 && (
                                <Accordion
                                    title={locale === 'ar' ? "المواصفات الفنية" : "Technical Specifications"}
                                    icon={<Star className="w-4 h-4 text-blue-600" />}
                                >
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-gray-600 border border-gray-200 rounded-lg">
                                            <thead>
                                                <tr className="bg-gray-50">
                                                    <th className="px-4 py-2 text-right font-bold text-gray-900 border-b">
                                                        {locale === 'ar' ? 'المواصفة' : 'Specification'}
                                                    </th>
                                                    <th className="px-4 py-2 text-left font-bold text-gray-900 border-b">
                                                        {locale === 'ar' ? 'القيمة' : 'Value'}
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {product.technicalSpecifications.map((spec: any, index: number) => (
                                                    <tr key={index} className="hover:bg-gray-50">
                                                        <td className="px-4 py-2 text-right font-medium border-b border-gray-100">
                                                            {spec.key}
                                                        </td>
                                                        <td className="px-4 py-2 text-left border-b border-gray-100">
                                                            {spec.value}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Accordion>
                            )}

                            {/* Shipping & Delivery Accordion */}
                            <Accordion
                                title={locale === 'ar' ? "الشحن والتوصيل" : "Shipping & Delivery"}
                                icon={<Truck className="w-4 h-4 text-purple-600" />}
                            >
                                <div className="text-gray-600 leading-relaxed text-sm">
                                    {locale === 'ar' 
                                        ? 'الدفع عند الاستلام. مدة التوصيل بين 24 و 72 ساعة لجميع المدن في المغرب.'
                                        : 'Cash on delivery. Delivery time is between 24 and 72 hours to all cities in Morocco.'}
                                </div>
                            </Accordion>
                        </div>
                    </div>
                </div>

                {relatedProducts.length > 0 && (
                    <section className="mt-16 pt-10 border-t border-gray-100">
                        <div className="mb-6">
                            <h2 className="text-2xl font-black text-gray-900 font-tajawal">
                                {isCurrentCheap
                                    ? (locale === 'ar' ? '🛒 أضف منتجات لإتمام طلبك' : '🛒 Build Your Order — Add More Items')
                                    : (locale === 'ar' ? '✨ منتجات قد تعجبك' : '✨ You Might Also Like')
                                }
                            </h2>
                            {isCurrentCheap && (
                                <p className="text-sm text-amber-700 font-bold mt-1 font-tajawal">
                                    {locale === 'ar'
                                        ? 'الحد الأدنى للطلب 149 درهم — أضف منتجات لإتمام طلبك'
                                        : 'Minimum order is 149 DH — add more items to complete your order'}
                                </p>
                            )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {relatedProducts.map((p: any) => (
                                <RelatedCard key={p.id} product={p} locale={locale} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Recently Viewed Products */}
                <RecentlyViewed currentProductId={product.id} />
            </div>

            {/* Sticky Mobile CTA */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 md:hidden z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex items-center gap-3 animate-in slide-in-from-bottom-full duration-500">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-bold uppercase">{locale === 'ar' ? 'السعر' : 'Price'}</span>
                    <span className="text-lg font-black text-emerald-600">{product.price} {tCommon('currency')}</span>
                </div>
                <button
                    onClick={() => {
                        // First add the item to cart
                        if (product.variants?.length > 0 && !selectedVariant) {
                            alert(locale === 'ar' ? 'المرجو اختيار المقاس' : 'Please select a variant');
                            return;
                        }
                        
                        const effectivePrice = getActivePrice();
                        const itemTotal = Number(effectivePrice) * quantity;
                        
                        // Calculate new cart total (existing cart + current item)
                        const currentCartTotal = cart.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0);
                        const newCartTotal = currentCartTotal + itemTotal;
                        
                        // Add item to cart
                        addToCart({ ...product, price: String(effectivePrice) }, selectedVariant || undefined, quantity);
                        
                        // Check if total meets MOV
                        if (newCartTotal < 149) {
                            const remaining = 149 - newCartTotal;
                            Swal.fire({
                                icon: 'info',
                                title: locale === 'ar' ? 'خطوة بسيطة لتأكيد طلبك!' : 'A simple step to confirm your order!',
                                html: `
                                    <div style="text-align: ${locale === 'ar' ? 'right' : 'left'}; direction: ${locale === 'ar' ? 'rtl' : 'ltr'};">
                                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
                                            <span style="font-size: 24px;">🎁</span>
                                            <span style="color: #10b981; font-weight: bold; font-size: 16px;">
                                                ${locale === 'ar' ? 'لضمان أفضل خدمة، المنتجات التي يقل سعرها عن 149 درهم تُباع كإضافة لطلبات أخرى.' : 'For the best service, products under 149 DH are sold as add-ons to other orders.'}
                                            </span>
                                        </div>
                                        <div style="margin-bottom: 16px; line-height: 1.5;">
                                            <span style="color: #374151;">
                                                ${locale === 'ar' 
                                                    ? `لقد أضفنا هذا المنتج إلى سلتك! أضف المزيد من المنتجات بقيمة <span style="color: #ef4444; font-weight: bold;">${remaining.toFixed(0)} درهم</span> لتأكيد طلبك.`
                                                    : `We've added this product to your cart! Add more products worth <span style="color: #ef4444; font-weight: bold;">${remaining.toFixed(0)} DH</span> to confirm your order.`
                                                }
                                            </span>
                                        </div>
                                    </div>
                                `,
                                showCancelButton: true,
                                showConfirmButton: true,
                                confirmButtonText: locale === 'ar' ? 'إضافة للسلة ومتابعة التسوق' : 'Add to cart & Continue Shopping',
                                cancelButtonText: locale === 'ar' ? 'أضف للسلة' : 'View Cart',
                                confirmButtonColor: '#10b981',
                                cancelButtonColor: '#6b7280',
                                reverseButtons: locale === 'ar'
                            }).then((result: any) => {
                                if (result.isConfirmed) {
                                    // Continue shopping - close modal and stay on page
                                    // Modal already closed by Swal
                                } else {
                                    // Go to cart
                                    router.push(`/${locale}/products`);
                                }
                            });
                        } else {
                            // MOV met, go to cart for checkout
                            router.push(`/${locale}/products`);
                        }
                    }}
                    className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg active:scale-95 transition"
                >
                    {locale === 'ar' ? 'أكد الطلب' : 'Confirm Order'}
                </button>
            </div>

            {/* Lightbox Modal */}
            {lightboxOpen && (
                <div 
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setLightboxOpen(false)}
                >
                    <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
                        <button
                            onClick={() => setLightboxOpen(false)}
                            className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition z-10"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <div className="relative w-full h-full flex items-center justify-center">
                            <img
                                src={lightboxImage}
                                alt="Product image fullscreen"
                                className="max-w-full max-h-full object-contain select-none"
                                onContextMenu={(e) => e.preventDefault()}
                                draggable={false}
                            />
                            {/* Watermark in lightbox */}
                            <div className="absolute bottom-4 right-4 text-white opacity-60 pointer-events-none select-none font-bold text-lg">
                                Luxe Store
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
