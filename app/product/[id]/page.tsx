"use client";

import { use, useState, useEffect } from "react";
import { useShop, Product } from "@/context/ShopContext";
import { ArrowRight, Minus, Plus, ShoppingCart, CheckCircle, Loader2, Star } from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { db } from "@/lib/firebase";

interface ProductPageProps {
    params: Promise<{ id: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
    const { id } = use(params);
    const { products, addToCart, settings } = useShop();
    const [product, setProduct] = useState<Product | undefined>(undefined);
    const [qty, setQty] = useState(1);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [formData, setFormData] = useState({ name: "", phone: "", city: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (products.length > 0 && id) {
            const found = products.find(p => p.id === id);
            setProduct(found);
        }
    }, [products, id]);

    if (!product) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    // Pricing Logic
    const regularPrice = Number(product.price);
    const wholesalePrice = Number(product.wholesalePrice || product.price);
    const minWholesale = product.minWholesaleQty || 0;
    const isWholesaleActive = minWholesale > 0 && qty >= minWholesale;
    const unitPrice = isWholesaleActive ? wholesalePrice : regularPrice;
    const totalPrice = unitPrice * qty;

    // Helper to get title string
    const getProductTitle = (p: Product) => {
        if (!p?.title) return "";
        if (typeof p.title === 'object') {
            return (p.title as any)['ar'] || (p.title as any)['en'] || (p.title as any)['fr'] || "";
        }
        return p.title;
    };

    const displayTitle = getProductTitle(product);

    const handleOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const message = `
<b>New Order! 🔔</b>
<b>Product:</b> ${product.title}
<b>Qty:</b> ${qty} ${isWholesaleActive ? '(Wholesale)' : ''}
<b>Price:</b> ${unitPrice} DH (Total: ${totalPrice})
<b>Client:</b> ${formData.name}
<b>Phone:</b> ${formData.phone}
<b>City:</b> ${formData.city}
<b>Address:</b> ${(formData as any).address || 'N/A'}
            `;

            await fetch('/api/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegramId: settings.telegramId, message })
            });

            Swal.fire({
                icon: 'success',
                title: 'تم الطلب بنجاح!',
                text: 'سنتصل بك قريباً للتأكيد',
                confirmButtonColor: '#10b981'
            });
            setFormData({ name: "", phone: "", city: "" });

        } catch (err) {
            alert("Error sending order");
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        addToCart(product, undefined, qty);
        toast.success("تمت الإضافة للسلة");
    };

    return (
        <div className="min-h-screen bg-white pb-20 font-tajawal">
            {/* Header */}
            <div className="bg-white shadow-sm border-b py-4 mb-6">
                <div className="container mx-auto px-4 flex items-center gap-4">
                    <Link href="/" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
                        <ArrowRight className="w-5 h-5 text-gray-600" />
                    </Link>
                    <h1 className="text-lg font-bold text-gray-900 truncate">العودة</h1>
                </div>
            </div>

            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row gap-8 bg-white p-6 rounded-3xl shadow-sm">

                    {/* Images */}
                    <div className="w-full md:w-1/2">
                        <div className="aspect-square relative overflow-hidden rounded-2xl bg-gray-100 mb-4 border border-gray-100">
                            <img
                                src={product.images?.[activeImageIndex] || product.image}
                                className="w-full h-full object-cover"
                                alt={displayTitle}
                            />
                            {product.discountLabel && (
                                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-black shadow-md z-10">
                                    {product.discountLabel}
                                </div>
                            )}
                        </div>
                        {/* Thumbnails */}
                        {(product.images?.length ?? 0) > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {product.images!.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImageIndex(idx)}
                                        className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${activeImageIndex === idx ? "border-emerald-600" : "border-transparent"}`}
                                    >
                                        <img src={img} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="w-full md:w-1/2 flex flex-col">
                        <h1 className="text-3xl font-black text-gray-900 mb-4">{displayTitle}</h1>

                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-4xl font-black text-emerald-600">{totalPrice} DH</span>
                            {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                                <span className="text-xl text-gray-400 line-through font-bold">
                                    {(Number(product.originalPrice) * qty).toFixed(2).replace(/\.00$/, '')} DH
                                </span>
                            )}
                        </div>

                        {/* Qty */}
                        <div className="flex items-center gap-4 mb-8 bg-gray-50 p-2 rounded-xl w-fit">
                            <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 bg-white rounded-lg shadow-sm hover:scale-105 transition"><Minus className="w-4 h-4" /></button>
                            <span className="text-xl font-bold w-12 text-center">{qty}</span>
                            <button onClick={() => setQty(qty + 1)} className="p-3 bg-white rounded-lg shadow-sm hover:scale-105 transition"><Plus className="w-4 h-4" /></button>
                        </div>

                        {/* Order Form */}
                        <form onSubmit={handleOrder} className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <h3 className="font-bold text-lg text-gray-800 mb-2">معلومات الدفع والتوصيل</h3>
                            <div className="space-y-3">
                                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="الاسم الكامل" className="w-full p-3 bg-white border rounded-xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                                <input required type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="رقم الهاتف" className="w-full p-3 bg-white border rounded-xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                                <input value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} placeholder="المدينة" className="w-full p-3 bg-white border rounded-xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                                <input required value={(formData as any).address || ""} onChange={e => setFormData({ ...formData, address: e.target.value } as any)} placeholder="العنوان (ضروري)" className="w-full p-3 bg-white border rounded-xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                            </div>
                            <button
                                disabled={loading}
                                className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black text-lg shadow-lg hover:bg-emerald-700 transition flex justify-center gap-2 items-center"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <><span>اطلب الآن - والدفع عند الاستلام</span> <CheckCircle className="w-5 h-5" /></>}
                            </button>
                        </form>

                        {/* Add To Cart */}
                        {product.allowAddToCart && (
                            <button onClick={handleAddToCart} className="mt-4 w-full border-2 border-gray-200 text-gray-600 py-3 rounded-xl font-bold hover:border-gray-900 hover:text-gray-900 transition flex justify-center gap-2">
                                <ShoppingCart className="w-5 h-5" /> إضافة للسلة
                            </button>
                        )}

                        {/* Description */}
                        {product.description && (
                            <div className="mt-8 pt-8 border-t">
                                <h3 className="font-bold text-xl mb-4">وصف المنتج</h3>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Reviews Section Removed - Moved to Homepage */}

            {/* RELATED PRODUCTS SECTION */}
            {products.filter(p => p.category === product.category && p.id !== product.id).length > 0 && (
                <div className="container mx-auto px-4 mt-12">
                    <h3 className="font-bold text-2xl text-gray-900 mb-6 flex items-center gap-2">
                        منتجات قد تعجبك also ✨
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {products
                            .filter(p => p.category === product.category && p.id !== product.id)
                            .slice(0, 4)
                            .map(p => {
                                const pTitle = getProductTitle(p);
                                return (
                                    <Link href={`/product/${p.id}`} key={p.id} className="group bg-white p-3 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 block">
                                        <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-3 relative">
                                            <img
                                                src={p.image}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                alt={pTitle}
                                            />
                                            {p.discountLabel && (
                                                <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                                    {p.discountLabel}
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="font-bold text-gray-800 text-sm truncate mb-1">{pTitle}</h4>
                                        <div className="flex items-center justify-between">
                                            <span className="font-black text-emerald-600">{p.price} DH</span>
                                            <span className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                                <ArrowRight className="w-4 h-4 -rotate-45" />
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                    </div>
                </div>
            )}
        </div>
    );
}
