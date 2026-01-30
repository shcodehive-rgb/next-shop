"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
    collection,
    onSnapshot,
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    updateDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase"; // تأكدي أن هذا المسار صحيح

// --- TYPES ---
export interface Review {
    id: string;
    reviewer: string;
    rating: number; // 1-5
    comment: string;
    date: string;
}

export interface Product {
    id: string;
    title: string;
    price: string;
    image: string;
    images?: string[];
    category: string;
    description?: string;
    cost?: string;
    stock?: number;
    wholesalePrice?: string;
    minWholesaleQty?: number;
    allowAddToCart?: boolean;
    reviews?: Review[];
    isBestSeller?: boolean;
    originalPrice?: number;
    discountLabel?: string;
}

export interface Category {
    id: string;
    name: string;
    image: string;
}

export interface CartItem extends Product {
    qty: number;
}

export interface SiteSettings {
    storeName: string;
    telegramId: string;
    sheetUrl: string;
    heroImage: string;
    facebookPixelId?: string;
    tiktokPixelId?: string;
    favicon?: string;
    primaryColor?: string;
    phoneNumber?: string;
    adminPassword?: string;
    middleBanner?: string;
    middleBannerLink?: string;
    showFeatures?: boolean;
}

interface ShopContextType {
    products: Product[];
    categories: Category[];
    cart: CartItem[];
    settings: SiteSettings;
    addProduct: (p: Product) => void;
    updateProduct: (id: string, p: Partial<Product>) => void;
    deleteProduct: (id: string) => void;
    addCategory: (c: Category) => void;
    deleteCategory: (id: string) => void;
    addToCart: (p: Product, qty?: number) => void;
    removeFromCart: (id: string) => void;
    updateCartQty: (id: string, qty: number) => void;
    clearCart: () => void;
    updateSettings: (s: Partial<SiteSettings>) => void;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    filteredProducts: Product[];
    isStoreActive: boolean;
}

// --- DEFAULTS ---
const defaultSettings: SiteSettings = {
    storeName: "NEXT STORE",
    telegramId: "",
    sheetUrl: "",
    heroImage: "https://placehold.co/600x400/10b981/ffffff?text=Welcome",
    primaryColor: "#10b981",
    showFeatures: true,
};

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
    const [searchQuery, setSearchQuery] = useState("");
    const [isStoreActive, setIsStoreActive] = useState(true);

    // 🔥 1. REAL-TIME DATA SYNC (The Fix)
    useEffect(() => {
        // A. Listen to Products (Real-time from Firebase)
        const unsubProducts = onSnapshot(collection(db, "demo_chima"), (snapshot) => {
            const productList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Product[];
            setProducts(productList);
        }, (error) => {
            console.error("Error fetching products:", error);
        });

        // B. Listen to Categories (Real-time from Firebase)
        const unsubCategories = onSnapshot(collection(db, "categories"), (snapshot) => {
            const categoryList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Category[];
            setCategories(categoryList);
        }, (error) => {
            console.error("Error fetching categories:", error);
        });

        // C. Listen to Settings (Real-time)
        const unsubSettings = onSnapshot(doc(db, "settings", "general"), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data() as any;
                setSettings({ ...defaultSettings, ...data });

                // Kill Switch Logic
                if (data.storeStatus === 'suspended') {
                    setIsStoreActive(false);
                } else {
                    // Simple logic: if not suspended, it's active
                    setIsStoreActive(true);
                }
            }
        });

        // D. Load Cart from LocalStorage (Cart should remain local)
        const localCart = localStorage.getItem("cart");
        if (localCart) setCart(JSON.parse(localCart));

        // Cleanup listeners on unmount
        return () => {
            unsubProducts();
            unsubCategories();
            unsubSettings();
        };
    }, []);

    // --- ACTIONS WITH FIREBASE SYNC ---

    // إضافة منتج (يكتب في Firebase مباشرة)
    const addProduct = async (p: Product) => {
        try {
            await setDoc(doc(db, "products", p.id), p);
            // No need to setProducts manually, onSnapshot will do it
        } catch (e) {
            console.error("Error adding product", e);
        }
    };

    // تحديث منتج
    const updateProduct = async (id: string, p: Partial<Product>) => {
        try {
            await updateDoc(doc(db, "products", id), p);
        } catch (e) {
            console.error("Error updating product", e);
        }
    };

    // حذف منتج
    const deleteProduct = async (id: string) => {
        try {
            await deleteDoc(doc(db, "products", id));
        } catch (e) {
            console.error("Error deleting product", e);
        }
    };

    // إضافة تصنيف
    const addCategory = async (c: Category) => {
        try {
            await setDoc(doc(db, "categories", c.id), c);
        } catch (e) {
            console.error("Error adding category", e);
        }
    };

    // حذف تصنيف
    const deleteCategory = async (id: string) => {
        try {
            await deleteDoc(doc(db, "categories", id));
        } catch (e) {
            console.error("Error deleting category", e);
        }
    };

    // تحديث الإعدادات
    const updateSettings = async (s: Partial<SiteSettings>) => {
        try {
            await setDoc(doc(db, "settings", "general"), { ...settings, ...s }, { merge: true });
        } catch (e) {
            console.error("Error saving settings", e);
        }
    };

    // --- CART (Local Only) ---
    const addToCart = (p: Product, qty = 1) => {
        setCart((prev) => {
            const existing = prev.find((i) => i.id === p.id);
            let newCart;
            if (existing) {
                newCart = prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + qty } : i));
            } else {
                newCart = [...prev, { ...p, qty }];
            }
            localStorage.setItem("cart", JSON.stringify(newCart));
            return newCart;
        });
    };

    const removeFromCart = (id: string) => {
        setCart((prev) => {
            const newCart = prev.filter((i) => i.id !== id);
            localStorage.setItem("cart", JSON.stringify(newCart));
            return newCart;
        });
    };

    const updateCartQty = (id: string, qty: number) => {
        if (qty < 1) return removeFromCart(id);
        setCart((prev) => {
            const newCart = prev.map((i) => (i.id === id ? { ...i, qty } : i));
            localStorage.setItem("cart", JSON.stringify(newCart));
            return newCart;
        });
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem("cart");
    };

    // --- SEARCH ---
    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <ShopContext.Provider
            value={{
                products,
                categories,
                cart,
                settings,
                addProduct,
                updateProduct,
                deleteProduct,
                addCategory,
                deleteCategory,
                addToCart,
                removeFromCart,
                updateCartQty,
                clearCart,
                updateSettings,
                searchQuery,
                setSearchQuery,
                filteredProducts,
                isStoreActive
            }}
        >
            {children}
        </ShopContext.Provider>
    );
}

export const useShop = () => {
    const context = useContext(ShopContext);
    if (!context) throw new Error("useShop must be used within a ShopProvider");
    return context;
};