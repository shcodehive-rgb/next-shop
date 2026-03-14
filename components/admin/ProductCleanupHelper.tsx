"use client";

import { useState, useEffect } from "react";
import { useShop, Product } from "@/context/ShopContext";
import { Trash2, Shield, AlertTriangle, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";

export default function ProductCleanupHelper() {
    const { products, deleteProduct } = useShop();
    const [analysis, setAnalysis] = useState<{
        keep: Product[];
        delete: Product[];
        protected: Product[];
    }>({ keep: [], delete: [], protected: [] });

    // Analyze products on mount
    useEffect(() => {
        const protectedProducts = products.filter(p => 
            p.title?.toString().toLowerCase().includes("ankle belts") ||
            p.title?.toString().toLowerCase().includes("kenzio") ||
            p.category === "Sport and health"
        );

        const fitnessKeywords = [
            "sport", "fitness", "exercise", "workout", "gym", "muscle",
            "training", "resistance", "yoga", "running", "cardio",
            "ankle", "buttock", "tape", "support", "medical", "health",
            "protein", "supplement", "equipment", "gear", "athletic"
        ];

        const keepProducts = products.filter(p => {
            const title = p.title?.toString().toLowerCase() || "";
            const category = p.category?.toLowerCase() || "";
            const description = p.description?.toLowerCase() || "";
            
            return fitnessKeywords.some(keyword => 
                title.includes(keyword) || 
                category.includes(keyword) || 
                description.includes(keyword)
            );
        });

        const deleteProducts = products.filter(p => 
            !protectedProducts.includes(p) && !keepProducts.includes(p)
        );

        setAnalysis({
            protected: protectedProducts,
            keep: keepProducts,
            delete: deleteProducts
        });
    }, [products]);

    const handleDeleteProduct = async (product: Product) => {
        // Check if it's a protected product
        const isProtected = analysis.protected.includes(product);
        if (isProtected) {
            toast.error("⚠️ CANNOT DELETE: This product is protected (Facebook Ads active)");
            return;
        }

        if (confirm(`Are you sure you want to delete "${product.title}"? This action cannot be undone.`)) {
            try {
                await deleteProduct(product.id);
                toast.success(`✅ Deleted: ${product.title}`);
            } catch (error) {
                toast.error(`❌ Failed to delete: ${error}`);
            }
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                <h1 className="text-2xl font-black text-emerald-900 mb-2">
                    🏋️ Fitness Store Cleanup
                </h1>
                <p className="text-emerald-700">
                    Transition to pure fitness/sports niche - Keep only fitness-related products
                </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <Shield className="w-8 h-8 text-red-600" />
                        <div>
                            <p className="text-2xl font-bold text-red-900">{analysis.protected.length}</p>
                            <p className="text-red-700 text-sm">Protected (DO NOT TOUCH)</p>
                        </div>
                    </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                        <div>
                            <p className="text-2xl font-bold text-green-900">{analysis.keep.length}</p>
                            <p className="text-green-700 text-sm">Keep (Fitness Related)</p>
                        </div>
                    </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <Trash2 className="w-8 h-8 text-orange-600" />
                        <div>
                            <p className="text-2xl font-bold text-orange-900">{analysis.delete.length}</p>
                            <p className="text-orange-700 text-sm">Delete (Non-Fitness)</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Protected Products */}
            {analysis.protected.length > 0 && (
                <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
                    <h2 className="text-xl font-black text-red-900 mb-4 flex items-center gap-2">
                        <Shield className="w-6 h-6" />
                        PROTECTED PRODUCTS - DO NOT MODIFY
                    </h2>
                    <div className="space-y-3">
                        {analysis.protected.map(product => (
                            <div key={product.id} className="bg-white border border-red-200 rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-red-900">
                                            {typeof product.title === 'string' ? product.title : JSON.stringify(product.title)}
                                        </h3>
                                        <p className="text-red-700 text-sm">Category: {product.category}</p>
                                        <p className="text-red-600 text-xs mt-1">
                                            ⚠️ Facebook Ads active - URL must remain unchanged
                                        </p>
                                    </div>
                                    <Shield className="w-6 h-6 text-red-600" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Products to Keep */}
            {analysis.keep.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <h2 className="text-xl font-black text-green-900 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-6 h-6" />
                        Products to Keep (Fitness Related)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {analysis.keep.map(product => (
                            <div key={product.id} className="bg-white border border-green-200 rounded-lg p-4">
                                <h3 className="font-bold text-green-900">
                                    {typeof product.title === 'string' ? product.title : JSON.stringify(product.title)}
                                </h3>
                                <p className="text-green-700 text-sm">Category: {product.category}</p>
                                <p className="text-green-600 text-sm">Price: {product.price} DH</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Products to Delete */}
            {analysis.delete.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                    <h2 className="text-xl font-black text-orange-900 mb-4 flex items-center gap-2">
                        <Trash2 className="w-6 h-6" />
                        Products to Delete (Non-Fitness)
                    </h2>
                    <div className="space-y-3">
                        {analysis.delete.map(product => (
                            <div key={product.id} className="bg-white border border-orange-200 rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-orange-900">
                                            {typeof product.title === 'string' ? product.title : JSON.stringify(product.title)}
                                        </h3>
                                        <p className="text-orange-700 text-sm">Category: {product.category}</p>
                                        <p className="text-orange-600 text-sm">Price: {product.price} DH</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteProduct(product)}
                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Safety Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h2 className="text-xl font-black text-blue-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6" />
                    Safety Instructions
                </h2>
                <div className="space-y-2 text-blue-800">
                    <p>✅ Protected products have active Facebook Ads - DO NOT modify their URLs</p>
                    <p>✅ Backup your product data before deletion</p>
                    <p>✅ Test all URLs after cleanup</p>
                    <p>✅ Verify navigation and checkout still work</p>
                </div>
            </div>
        </div>
    );
}
