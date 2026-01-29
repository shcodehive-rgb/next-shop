"use client";

import { useState, useEffect } from "react";
import { Product, useShop } from "@/context/ShopContext";
// Wait, I don't have shadcn installed. I'll use a custom fixed div like CheckoutModal.
import { X, CheckCircle, Loader2, Minus, Plus, ShoppingCart } from "lucide-react";
import Swal from "sweetalert2";

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | undefined;
}

export default function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
    const { addToCart, settings } = useShop();
    const [qty, setQty] = useState(1);
    const [formData, setFormData] = useState({ name: "", phone: "", city: "" });
    const [loading, setLoading] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    // Reset state when product opens
    useEffect(() => {
        setQty(1);
        setActiveImageIndex(0);
        setFormData({ name: "", phone: "", city: "" });
    }, [product]);

    if (!isOpen || !product) return null;

    // --- PRICING LOGIC ---
    const regularPrice = Number(product.price);
    const wholesalePrice = Number(product.wholesalePrice || product.price);
    const minWholesale = product.minWholesaleQty || 0;

    const isWholesaleActive = minWholesale > 0 && qty >= minWholesale;
    const unitPrice = isWholesaleActive ? wholesalePrice : regularPrice;
    const totalPrice = unitPrice * qty;

    const handleOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Track 'AddToCart' equivalent for direct order
        if ((window as any).fbq) (window as any).fbq('track', 'AddToCart');
        if ((window as any).ttq) (window as any).ttq.track('AddToCart');

        // Call API
        try {
            const message = `
<b>New Order! 🔔</b>
<b>Product:</b> ${product.title}
<b>Qty:</b> ${qty} ${isWholesaleActive ? '(Wholesale)' : ''}
<b>Price:</b> ${unitPrice} DH (Total: ${totalPrice})
<b>Client:</b> ${formData.name}
<b>Phone:</b> ${formData.phone}
<b>City:</b> ${formData.city}
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
            onClose();

        } catch (err) {
            alert("Error sending order");
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        // Track 'AddToCart'
        if ((window as any).fbq) (window as any).fbq('track', 'AddToCart');
        if ((window as any).ttq) (window as any).ttq.track('AddToCart');

        addToCart(product, qty);
        toast.success("تمت الإضافة للسلة");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in font-tajawal">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative flex flex-col md:flex-row overflow-hidden">

                <button onClick={onClose} className="absolute top-4 left-4 p-2 bg-white/50 hover:bg-white rounded-full z-10 text-gray-800 hover:text-red-500 transition-colors">
                    <X className="w-6 h-6" />
                </button>

                {/* LEFT: IMAGE GALLERY */}
                <div className="w-full md:w-1/2 bg-gray-100 relative flex flex-col">

                    {/* Main Active Image */}
                    <div className="flex-1 relative overflow-hidden group">
                        <img
                            src={product.images?.[activeImageIndex] || product.image}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            key={activeImageIndex} // force re-render for anim
                        />

                        {/* Wholsale Badge */}
                        {isWholesaleActive && (
                            <div className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse z-10">
                                سعر الجملة مفعل! 🔥
                            </div>
                        )}
                        {/* Discount Badge */}
                        {(product.discountLabel) && (
                            <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-black shadow-md z-10">
                                {product.discountLabel}
                            </div>
                        )}

                        {/* Nav Arrows (Optional, but thumbnails are enough for now) */}
                    </div>

                    {/* Thumbnails (Only if > 1 image) */}
                    {(product.images?.length ?? 0) > 1 && (
                        <div className="flex gap-2 p-2 overflow-x-auto bg-white border-t scrollbar-hide z-20 shadow-inner">
                            {product.images!.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImageIndex(idx)}
                                    className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${activeImageIndex === idx ? "border-emerald-600 opacity-100 scale-105 shadow-md" : "border-transparent opacity-60 hover:opacity-100 grayscale hover:grayscale-0"}`}
                                >
                                    <img src={img} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT: DETAILS & FORM */}
                <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col bg-white">

                    <div className="mb-6">
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">{product.title}</h2>
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-3xl font-black" style={{ color: settings.primaryColor || '#059669' }}>{totalPrice} DH</span>
                            {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                                <span className="text-xl text-gray-400 font-bold line-through decoration-red-500 decoration-2">
                                    {(Number(product.originalPrice) * qty).toFixed(2).replace(/\.00$/, '')} DH
                                </span>
                            )}
                            {isWholesaleActive && <span className="text-blue-600 font-bold text-sm bg-blue-50 px-2 py-1 rounded-lg">سعر الجملة مفعل</span>}
                        </div>
                        {minWholesale > 0 && (
                            <p className="text-sm text-blue-600 mt-1 font-bold">
                                💡 اشتر {minWholesale} قطع أو أكثر للحصول على سعر {wholesalePrice} DH
                            </p>
                        )}
                    </div>

                    {/* QTY CONTROL */}
                    <div className="flex items-center gap-4 mb-8 bg-gray-50 p-2 rounded-xl w-fit">
                        <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 bg-white rounded-lg shadow-sm hover:scale-105 transition"><Minus className="w-4 h-4" /></button>
                        <span className="text-xl font-bold w-8 text-center">{qty}</span>
                        <button onClick={() => setQty(qty + 1)} className="p-3 bg-white rounded-lg shadow-sm hover:scale-105 transition"><Plus className="w-4 h-4" /></button>
                    </div>

                    {/* REVIEWS DISPLAY */}
                    {(product.reviews && product.reviews.length > 0) && (
                        <div className="mb-6 space-y-3">
                            <h4 className="font-bold text-gray-900 text-sm">⭐ تقييمات العملاء ({product.reviews.length})</h4>
                            <div className="space-y-3 bg-yellow-50/50 p-4 rounded-xl border border-yellow-100 max-h-40 overflow-y-auto custom-scrollbar">
                                {product.reviews.map((r, i) => (
                                    <div key={i} className="text-sm border-b border-yellow-100 last:border-0 pb-2 last:pb-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold text-gray-800">{r.reviewer}</span>
                                            <div className="text-yellow-500 text-xs">{"★".repeat(r.rating)}</div>
                                        </div>
                                        <p className="text-gray-600 text-xs leading-relaxed">{r.comment}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* FORM */}
                    <form onSubmit={handleOrder} className="space-y-4 flex-1">
                        <div className="space-y-3">
                            <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="الاسم الكامل" className="w-full p-3 bg-gray-50 border rounded-xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                            <input required type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="رقم الهاتف" className="w-full p-3 bg-gray-50 border rounded-xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                            <input value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} placeholder="المدينة" className="w-full p-3 bg-gray-50 border rounded-xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                        </div>

                        <button
                            disabled={loading}
                            style={{ backgroundColor: settings.primaryColor || '#10b981' }}
                            className="w-full text-white py-4 rounded-xl font-black text-lg shadow-lg hover:brightness-90 transition flex justify-center gap-2 items-center"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <><span>اطلب الآن</span> <CheckCircle className="w-5 h-5" /></>}
                        </button>
                    </form>

                    {/* ADD TO CART TOGGLE */}
                    {product.allowAddToCart && (
                        <button onClick={handleAddToCart} className="mt-3 w-full border-2 border-gray-200 text-gray-600 py-3 rounded-xl font-bold hover:border-gray-900 hover:text-gray-900 transition flex justify-center gap-2">
                            <ShoppingCart className="w-5 h-5" /> إضافة للسلة
                        </button>
                    )}

                </div>
            </div>
        </div>
    );
}
// Import toast just in case, though I used Swal mostly.
import { toast } from "sonner";
