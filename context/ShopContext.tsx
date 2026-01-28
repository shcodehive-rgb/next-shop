"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
    image: string; // Primary Image (Kept for backward compat)
    images?: string[]; // Gallery
    category: string;
    description?: string;
    cost?: string; // Purchase Price
    stock?: number; // Stock Quantity
    wholesalePrice?: string;
    minWholesaleQty?: number;
    allowAddToCart?: boolean;
    reviews?: Review[];
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
    phoneNumber?: string; // WhatsApp
    adminPassword?: string;
}

// ... (ShopContextType remains mostly same but Product matches new ref)

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
    primaryColor: "#10b981", // Emerald 500 default
};

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
    const [searchQuery, setSearchQuery] = useState(""); // Search State
    const [isLoaded, setIsLoaded] = useState(false);
    const [isStoreActive, setIsStoreActive] = useState(true); // Default active

    // 1. LOAD DATA & CHECK STATUS
    useEffect(() => {
        try {
            // Local Storage Load
            const localProd = localStorage.getItem("admin_products");
            const localCats = localStorage.getItem("admin_categories");
            const localSet = localStorage.getItem("siteSettings");

            if (localProd) {
                const parsedProducts: Product[] = JSON.parse(localProd);
                const migratedProducts = parsedProducts.map(p => ({
                    ...p,
                    images: p.images || (p.image ? [p.image] : [])
                }));
                setProducts(migratedProducts);
            }
            if (localCats) setCategories(JSON.parse(localCats));
            if (localSet) setSettings({ ...defaultSettings, ...JSON.parse(localSet) });

            setIsLoaded(true);

            // 🛑 KILL SWITCH CHECK (Firebase)
            import("firebase/firestore").then(({ doc, getDoc }) => {
                const { db } = require("@/lib/firebase");
                // Correctly define settingsRef before use
                const settingsRef = doc(db, "settings", "general");

                getDoc(settingsRef).then((snap: any) => {
                    if (snap.exists()) {
                        const data = snap.data();

                        // 1. Manual Kill Switch (Priority)
                        if (data.storeStatus === 'suspended') {
                            setIsStoreActive(false);
                            return;
                        }

                        // 2. Automated Trial Logic
                        const isPaid = data.isPaid === true;
                        const trialStartDate = data.trialStartDate ? new Date(data.trialStartDate) : null;

                        if (isPaid) {
                            // ✅ Client paid -> Always Active
                            setIsStoreActive(true);
                        } else if (trialStartDate) {
                            // ⏳ Check Trial Duration
                            const now = new Date();
                            const diffTime = Math.abs(now.getTime() - trialStartDate.getTime());
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                            if (diffDays > 3) {
                                console.log("🚫 Trial Expired");
                                setIsStoreActive(false); // Lock it!
                            } else {
                                setIsStoreActive(true); // Still in trial
                            }
                        } else {
                            // Fallback: If no date set, assume active
                            setIsStoreActive(true);
                        }
                    }
                });
            });

        } catch (e) {
            console.error("Failed to load", e);
        }
    }, []);

    // 2. PERSISTENCE HELPERS
    const saveProducts = (newProducts: Product[]) => {
        setProducts(newProducts);
        localStorage.setItem("admin_products", JSON.stringify(newProducts));
    };

    const saveCategories = (newCategories: Category[]) => {
        setCategories(newCategories);
        localStorage.setItem("admin_categories", JSON.stringify(newCategories));
    };

    const saveSettings = (newSettings: SiteSettings) => {
        setSettings(newSettings);
        localStorage.setItem("siteSettings", JSON.stringify(newSettings));
    };

    // --- ACTIONS ---
    const addProduct = (p: Product) => saveProducts([...products, p]);

    const updateProduct = (id: string, p: Partial<Product>) => {
        saveProducts(products.map((item) => (item.id === id ? { ...item, ...p } : item)));
    };

    const deleteProduct = (id: string) => {
        saveProducts(products.filter((item) => item.id !== id));
    };

    const addCategory = (c: Category) => saveCategories([...categories, c]);

    const deleteCategory = (id: string) => saveCategories(categories.filter(c => c.id !== id));

    const updateSettings = (s: Partial<SiteSettings>) => {
        saveSettings({ ...settings, ...s });
    };

    // --- CART ---
    const addToCart = (p: Product, qty = 1) => {
        setCart((prev) => {
            const existing = prev.find((i) => i.id === p.id);
            if (existing) {
                return prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + qty } : i));
            }
            return [...prev, { ...p, qty }];
        });
    };

    const removeFromCart = (id: string) => {
        setCart((prev) => prev.filter((i) => i.id !== id));
    };

    const updateCartQty = (id: string, qty: number) => {
        if (qty < 1) return removeFromCart(id);
        setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
    };

    const clearCart = () => setCart([]);

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
            {/* Avoid Hydration mismatch by rendering children only after mount, or just accept clean flicker */}
            {children}
        </ShopContext.Provider>
    );
}

export const useShop = () => {
    const context = useContext(ShopContext);
    if (!context) throw new Error("useShop must be used within a ShopProvider");
    return context;
};
