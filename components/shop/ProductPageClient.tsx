"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Minus, Plus, ShoppingCart, CheckCircle, Loader2, ArrowLeft, Star, ChevronDown, Truck } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { toast } from "sonner";
import ProductReviews from "./ProductReviews";
import ProductCard from "./ProductCard";
import { useRouter } from "next/navigation";

interface ProductPageClientProps {
    product: any;
    allProducts: any[];
    locale: string;
    title: string;
    description: string;
}

export default function ProductPageClient({
    product,
    allProducts,
    locale,
    title,
    description,
}: ProductPageClientProps) {
    const router = useRouter();
    const [qty, setQty] = useState(1);
    const [formData, setFormData] = useState({ name: "", phone: "", city: "" });
    const [loading, setLoading] = useState(false);
    const [successModal, setSuccessModal] = useState(false);
    const { addToCart, settings } = useShop();
    const [descOpen, setDescOpen] = useState(false);
    const [delOpen, setDelOpen] = useState(false);

    const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const stored = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
        const updated = [product.id, ...stored.filter((id: string) => id !== product.id)].slice(0, 10);
        localStorage.setItem("recentlyViewed", JSON.stringify(updated));
        const recentProducts = updated.slice(1, 5).map(id => allProducts.find(p => p.id === id)).filter(Boolean);
        setRecentlyViewed(recentProducts);
    }, [product.id, allProducts]);

    const relatedProducts = allProducts.filter(p => p.category === product.category && p.id !== product.id && p.visible !== false).slice(0, 4);
    const isAr = locale === "ar";
    const regularPrice = Number(product.price);
    const wholesalePrice = Number(product.wholesalePrice || product.price);
    const minWholesale = product.minWholesaleQty || 0;
    const isWholesaleActive = minWholesale > 0 && qty >= minWholesale;
    const unitPrice = isWholesaleActive ? wholesalePrice : regularPrice;
    const totalPrice = unitPrice * qty;

    const handleAddToCart = () => {
        addToCart(product, undefined, qty);
        toast.success(`Added ${qty} item(s) to cart`);
        setQty(1);
    };

    const handleBuyNow = async () => {
        if (!formData.name || !formData.phone || !formData.city) {
            toast.error("Please fill in all order details");
            return;
        }
        setLoading(true);
        setSuccessModal(true);
        try {
            const response = await fetch('/api/telegram-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: formData.name, phone: formData.phone, city: formData.city, productTitle: title, quantity: qty, totalPrice: totalPrice }),
            });
            if (!response.ok) throw new Error('Failed to send order');
            setTimeout(() => { setFormData({ name: "", phone: "", city: "" }); setQty(1); }, 2000);
            setTimeout(() => { setSuccessModal(false); }, 4000);
        } catch (error) {
            console.error('Error sending order:', error);
            toast.error("Order sent but confirmation failed. We'll contact you soon.");
            setTimeout(() => { setSuccessModal(false); }, 4000);
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsApp = () => {
        const productUrl = typeof window !== 'undefined' ? window.location.href : '';
        const messageText = `Bonjour, je suis intéressé(e) par ce produit : ${productUrl}`;
        const encodedMessage = encodeURIComponent(messageText);
        const phoneNumber = settings.whatsappPhone || settings.phoneNumber || "212688771251";
        const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
        window.open(whatsappUrl, "_blank");
    };

    return (
        <div className="min-h-screen bg-white" dir={isAr ? "rtl" : "ltr"}>
            {/* Header / Back Button */}
            <div className="container mx-auto px-4 pt-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors py-2 group"
                >
                    <ArrowLeft className={`w-5 h-5 transition-transform ${isAr ? 'group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`} />
                    <span className="text-sm font-medium uppercase tracking-widest">{isAr ? 'العودة' : 'Retour'}</span>
                </button>
            </div>

            <div className="container mx-auto px-4 py-6">
                {/* 1. PRODUCT TITLE - ALWAYS AT TOP */}
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 lg:mb-12">
                    {title}
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* 2. PRODUCT IMAGES */}
                    <div className="flex flex-col items-center gap-0">
                        {product.images?.slice(0, 10).map((image: string, index: number) => (
                            <div key={index} className="w-full aspect-square bg-gray-50 flex items-center justify-center overflow-hidden relative select-none" onContextMenu={(e) => e.preventDefault()}>
                                <img src={image} alt={`${title} - Image ${index + 1}`} className="w-full h-full object-contain block select-none" draggable={false} />
                                <div className="absolute inset-0 flex items-center justify-center text-white/30 text-3xl font-extrabold uppercase tracking-widest pointer-events-none transform -rotate-45 select-none z-10">
                                    Luxe Store
                                </div>
                            </div>
                        ))}

                        {/* Desktop Reviews - Below Images */}
                        <div className="hidden lg:block w-full mt-12">
                            <ProductReviews productId={product.id} />
                        </div>
                    </div>

                    {/* 3. PRICE, FORM, AND CTAs - STICKY ON DESKTOP */}
                    <div id="order-form" className="flex flex-col gap-6 lg:sticky lg:top-24 z-10 bg-white lg:p-4">
                        {/* Price Section */}
                        <div className="py-2 border-b border-gray-50">
                            <div className="flex items-baseline gap-3">
                                <span className="text-6xl font-black text-emerald-600 tracking-tighter">{unitPrice}</span>
                                <span className="text-2xl font-black text-gray-900">MAD</span>
                            </div>
                            {isWholesaleActive && (
                                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full mt-2">
                                    <CheckCircle className="w-3 h-3" />
                                    {isAr ? 'تم تفعيل سعر الجملة' : 'Prix de gros activé'}
                                </div>
                            )}
                        </div>

                        {/* Quantity & Total */}
                        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-lg shadow-sm"><Minus className="w-4 h-4" /></button>
                                <span className="text-xl font-black">{qty}</span>
                                <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-lg shadow-sm"><Plus className="w-4 h-4" /></button>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-gray-400 font-bold uppercase">{isAr ? 'الإجمالي' : 'Total'}</div>
                                <div className="text-2xl font-black text-emerald-600">{totalPrice} MAD</div>
                            </div>
                        </div>

                        {/* Order Form */}
                        <div className="space-y-3">
                            <input type="text" placeholder={isAr ? "الاسم الكامل" : "Votre Nom Complet"} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-5 py-4 border-2 border-gray-100 rounded-xl focus:border-emerald-500 outline-none font-bold" />
                            <input type="tel" placeholder={isAr ? "رقم الهاتف" : "Numéro de Téléphone"} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-5 py-4 border-2 border-gray-100 rounded-xl focus:border-emerald-500 outline-none font-bold" />
                            <input type="text" placeholder={isAr ? "المدينة" : "Ville"} value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full px-5 py-4 border-2 border-gray-100 rounded-xl focus:border-emerald-500 outline-none font-bold" />
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col gap-3">
                            <button onClick={handleBuyNow} disabled={loading} className="w-full bg-black text-white py-5 rounded-xl font-black text-xl shadow-xl active:scale-95 transition-all">
                                {loading ? "..." : (isAr ? "أكد الطلب الآن" : "Confirmer la commande")}
                            </button>
                            <div className="flex gap-3">
                                <button onClick={handleWhatsApp} className="flex-1 bg-[#25D366] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"><MessageCircle className="w-5 h-5 fill-white" /> WhatsApp</button>
                                <button onClick={handleAddToCart} className="flex-1 border-2 border-gray-200 py-4 rounded-xl font-bold flex items-center justify-center gap-2"><ShoppingCart className="w-5 h-5" /> {isAr ? 'للسلة' : 'Au Panier'}</button>
                            </div>
                        </div>

                        {/* 4. DESCRIPTION ACCORDION */}
                        {product.description && (
                            <div className="mt-4 border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                                <button
                                    onClick={() => setDescOpen(!descOpen)}
                                    className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                    <span className="font-black text-gray-900 uppercase tracking-widest text-sm">{isAr ? 'وصف المنتج' : 'Description du produit'}</span>
                                    <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${descOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <div className={`overflow-hidden transition-all duration-300 ${descOpen ? 'max-h-[2000px] border-t' : 'max-h-0'}`}>
                                    <div className="p-5 text-gray-600 leading-relaxed bg-white text-sm">
                                        {typeof product.description === 'string'
                                            ? product.description
                                            : product.description[locale] || product.description.fr || product.description.en}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 5. DELIVERY ACCORDION */}
                        <div className="mt-2 border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                            <button
                                onClick={() => setDelOpen(!delOpen)}
                                className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Truck className="w-5 h-5 text-emerald-600" />
                                    <span className="font-black text-gray-900 uppercase tracking-widest text-sm">
                                        {isAr ? 'التوصيل 24/48 ساعة' : 'Livraison 24/48h'}
                                    </span>
                                </div>
                                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${delOpen ? 'rotate-180' : ''}`} />
                            </button>
                            <div className={`overflow-hidden transition-all duration-300 ${delOpen ? 'max-h-[500px] border-t' : 'max-h-0'}`}>
                                <div className="p-5 text-gray-600 leading-relaxed bg-white text-sm font-medium">
                                    {isAr
                                        ? "توصيل سريع في جميع أنحاء المغرب بين 24 و 48 ساعة. الدفع عند الاستلام."
                                        : "Livraison rapide partout au Maroc entre 24h et 48h. Paiement à la livraison."}
                                </div>
                            </div>
                        </div>

                        {/* Mobile Reviews - Below Form */}
                        <div className="lg:hidden mt-8">
                            <ProductReviews productId={product.id} />
                        </div>
                    </div>
                </div>

                {/* Related & Recently Viewed Sections */}
                {relatedProducts.length > 0 && (
                    <div className="mt-20">
                        <h2 className="text-2xl font-black text-gray-900 mb-8 border-l-4 border-emerald-600 pl-4">{isAr ? 'منتجات مماثلة' : 'Produits Similaires'}</h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">{relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}</div>
                    </div>
                )}
                {recentlyViewed.length > 0 && (
                    <div className="mt-20 mb-20">
                        <h2 className="text-2xl font-black text-gray-900 mb-8 border-l-4 border-black pl-4">{isAr ? 'شوهد مؤخراً' : 'Récemment Consultés'}</h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">{recentlyViewed.map(p => <ProductCard key={p.id} product={p} />)}</div>
                    </div>
                )}
            </div>

            {/* Mobile Fixed Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t p-4 flex items-center justify-between shadow-lg">
                <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase">{isAr ? 'السعر الإجمالي' : 'Total'}</div>
                    <div className="text-xl font-black text-emerald-600">{totalPrice} MAD</div>
                </div>
                <button
                    onClick={() => document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-black text-white font-black px-8 py-3.5 rounded-xl uppercase text-sm"
                >
                    {isAr ? 'اشتر الآن' : 'Commander'}
                </button>
            </div>

            {/* Success Modal */}
            {successModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
                        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-black mb-2">{isAr ? 'تم استقبال طلبك!' : 'Commande Reçue!'}</h2>
                        <p className="text-gray-600 mb-6">{isAr ? 'سنتصل بك قريباً للتأكيد.' : 'Nous vous contacterons bientôt.'}</p>
                        <button onClick={() => setSuccessModal(false)} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold">OK</button>
                    </div>
                </div>
            )}
        </div>
    );
}
