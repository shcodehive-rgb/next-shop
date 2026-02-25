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
import { db, rtdb } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";

// --- TYPES ---
export interface Review {
    id: string;
    reviewer: string;
    rating: number; // 1-5
    comment: string;
    date: string;
}

export interface Bundle {
    qty: number;
    price: number;
    badgeText?: string;
}

export interface Product {
    id: string;
    title: string | { ar: string; en: string; fr: string };
    price: string;
    image: string;
    images?: string[];
    variants?: string[]; // Array of variants (e.g., ["S", "M", "L"])
    category: string;
    description?: string;
    highlights?: string; // Stored as newline-separated string
    howToUse?: string;
    ingredients?: string;
    videoUrl?: string;
    richContentImages?: string[];
    bundles?: Bundle[];
    hasVariants?: boolean;
    cost?: string; // Stored as newline-separated string
    stock?: number;
    wholesalePrice?: string;
    minWholesaleQty?: number;
    allowAddToCart?: boolean;
    selectedVariant?: string; // For cart items
    reviews?: Review[];
    isBestSeller?: boolean;
    originalPrice?: number;
    discountLabel?: string;
    shipping_type?: 'free' | 'standard'; // Free shipping or standard city rate
    visible?: boolean;
    technicalSpecifications?: { key: string; value: string }[];
    showInMidPageSlider?: boolean;
    metaTitle?: string;
    metaDescription?: string;
}

export interface Customer {
    id: string; // Phone number
    name: string;
    phone: string;
    city: string;
    totalSpent: number;
    lastOrder: string;
    ordersCount: number;
    interests: string[]; // Categories they bought from
}

export interface Blog {
    id: string;
    title: string;
    thumbnail: string;
    content: string;
    excerpt: string;
    seoDescription: string;
    publishDate: string;
    author: string;
    slug: string;
    status: 'draft' | 'published';
    createdAt: string;
    updatedAt: string;
}

export interface Category {
    id: string;
    name: string | { ar: string; en: string; fr: string };
    image: string;
}

export interface ShippingRate {
    id: string;
    city: string;
    price: number;
    isDefault: boolean;
}

export interface CartItem extends Product {
    qty: number;
}

export interface SiteSettings {
    storeName: string;
    telegramId: string;
    telegramBotToken: string;
    sheetUrl: string;
    heroImage: string;
    facebookPixelId?: string;
    tiktokPixelId?: string;
    whatsappPhone?: string;
    facebookPixelBackup1?: string;
    facebookPixelBackup2?: string;
    facebookAccessToken?: string;
    announcements?: string[];
    favicon?: string;
    primaryColor?: string;
    phoneNumber?: string;
    adminPassword?: string;
    middleBanner?: string;
    middleBannerLink?: string;
    showFeatures?: boolean;
    default_locale?: string;
    shippingMode?: 'free' | 'custom';
}

export interface Order {
    id: string;
    client: {
        name: string;
        phone: string;
        city: string;
        address?: string;
    };
    items: string; // "Product A (x1), Product B (x2)"
    total: number;
    status: string;
    createdAt: string;
    dateLocal: string;
    storeName: string;
    telegramId?: string;
    telegramNotificationId?: string;
    whatsappPhone?: string;
    deliveryTime?: string;
    shopSource?: string;
}

interface ShopContextType {
    products: Product[];
    categories: Category[];
    orders: Order[];
    customers: Customer[];
    cart: CartItem[];
    settings: SiteSettings;
    shippingRates: ShippingRate[];
    blogs: Blog[];

    // Actions
    addProduct: (p: Product) => Promise<void>;
    updateProduct: (id: string, p: Partial<Product>) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    addCategory: (c: Category) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    addBlog: (b: Blog) => Promise<void>;
    updateBlog: (id: string, b: Partial<Blog>) => Promise<void>;
    deleteBlog: (id: string) => Promise<void>;

    // Cart
    addToCart: (p: Product, variant?: string, qty?: number) => void;
    removeFromCart: (id: string, variant?: string) => void;
    updateCartQty: (id: string, qty: number, variant?: string) => void;
    clearCart: () => void;

    // Settings & Shipping
    updateSettings: (s: Partial<SiteSettings>) => Promise<void>;
    addShippingRate: (rate: ShippingRate) => Promise<void>;
    updateShippingRate: (id: string, rate: Partial<ShippingRate>) => Promise<void>;
    deleteShippingRate: (id: string) => Promise<void>;
    getShippingCost: (city: string) => number;

    // Search & Filtering
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    priceFilter: { min: number; max: number };
    setPriceFilter: (filter: { min: number; max: number }) => void;
    getFilteredProducts: () => Product[];
    filteredProducts: Product[];
    isStoreActive: boolean;

    // 🛒 UI State (Global)
    isCartOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    isCheckoutOpen: boolean;
    openCheckout: () => void;
    closeCheckout: () => void;
}

// --- DEFAULTS ---
const defaultSettings: SiteSettings = {
    storeName: "NEXT STORE",
    telegramId: "",
    telegramBotToken: "",
    sheetUrl: "",
    heroImage: "https://placehold.co/600x400/10b981/ffffff?text=Welcome",
    primaryColor: "#10b981",
    showFeatures: true,
    shippingMode: 'free',
};

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
    const [priceFilter, setPriceFilter] = useState<{ min: number; max: number }>({ min: 0, max: 1000 });
    const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isStoreActive, setIsStoreActive] = useState(true);

    // 🛒 UI State Implementation
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);
    const openCheckout = () => setIsCheckoutOpen(true);
    const closeCheckout = () => setIsCheckoutOpen(false);

    // Price filtering functions
    const getFilteredProducts = () => {
        return products.filter(product => {
            const price = Number(product.price);
            return price >= priceFilter.min && price <= priceFilter.max;
        });
    };

    // 🔥 1. REAL-TIME DATA SYNC
    useEffect(() => {
        // A. Listen to Products
        const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
            const productList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Product[];
            setProducts(productList);
        }, (error) => {
            console.error("Error fetching products:", error);
        });

        // B. Listen to Categories
        const unsubCategories = onSnapshot(collection(db, "categories"), (snapshot) => {
            const categoryList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Category[];
            setCategories(categoryList);
        }, (error) => {
            console.error("Error fetching categories:", error);
        });

        // C. Listen to Customers
        const unsubCustomers = onSnapshot(collection(db, "customers"), (snapshot) => {
            const customerList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Customer[];
            setCustomers(customerList);
        }, (error) => {
            console.error("Error fetching customers:", error);
        });

        // D. Listen to Shipping Rates
        const unsubShipping = onSnapshot(collection(db, "shipping_rates"), (snapshot) => {
            const ratesList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as ShippingRate[];
            setShippingRates(ratesList);
        }, (error) => {
            console.error("Error fetching shipping rates:", error);
        });

        // E. Listen to Settings
        const unsubSettings = onSnapshot(doc(db, "settings", "general"), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data() as any;
                setSettings({ ...defaultSettings, ...data });

                // Kill Switch Logic
                if (data.storeStatus === 'suspended') {
                    setIsStoreActive(false);
                } else {
                    setIsStoreActive(true);
                }
            }
        });

        // F. Listen to Blogs
        const unsubBlogs = onSnapshot(collection(db, "blogs"), (snapshot) => {
            const blogList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Blog[];
            setBlogs(blogList);
        }, (error) => {
            console.error("Error fetching blogs:", error);
        });

        // G. Load Cart from LocalStorage & Hydrate with Real-time Data
        const localCart = localStorage.getItem("cart");
        if (localCart) {
            try {
                let parsedCart: CartItem[] = JSON.parse(localCart);
                setCart(parsedCart);
            } catch (e) {
                console.error("Error parsing cart", e);
            }
        }

        return () => {
            unsubProducts();
            unsubCategories();
            unsubCustomers();
            unsubShipping();
            unsubSettings();
            unsubBlogs();
        };
    }, []);

    // 🔥 2. ORDERS DATA SYNC (Depends on Settings)
    useEffect(() => {
        if (!settings.storeName) return;

        const safeStoreName = settings.storeName.replace(/[.#$/\[\]]/g, "_");
        const ordersRef = ref(rtdb, `orders/${safeStoreName}`);

        const unsubOrders = onValue(ordersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Flatten: object of objects -> array
                const loadedOrders = Object.values(data) as Order[];
                // Optional: Sort by date desc
                loadedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setOrders(loadedOrders);
            } else {
                setOrders([]);
            }
        });

        return () => unsubOrders();
    }, [settings.storeName]);

    // --- ACTIONS WITH FIREBASE SYNC ---

    // إضافة منتج (يكتب في Firebase مباشرة)
    const addProduct = async (p: Product) => {
        try {
            await setDoc(doc(db, "products", p.id), p);
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
            await setDoc(doc(db, "settings", "general"), s, { merge: true });
        } catch (e) {
            console.error("Error saving settings", e);
        }
    };

    // Blog Management Functions
    const addBlog = async (b: Blog) => {
        try {
            await setDoc(doc(db, "blogs", b.id), b);
        } catch (e) {
            console.error("Error adding blog", e);
        }
    };

    const updateBlog = async (id: string, b: Partial<Blog>) => {
        try {
            await updateDoc(doc(db, "blogs", id), b);
        } catch (e) {
            console.error("Error updating blog", e);
        }
    };

    const deleteBlog = async (id: string) => {
        try {
            await deleteDoc(doc(db, "blogs", id));
        } catch (e) {
            console.error("Error deleting blog", e);
        }
    };

    // Helper to save cart to local storage (stripping large data)
    const saveCartToLocal = (cartItems: CartItem[]) => {
        try {
            const minimizedCart = cartItems.map(item => ({
                id: item.id,
                qty: item.qty,
                title: item.title,
                price: item.price,
                image: item.image?.length > 1000 ? "" : item.image,
            }));
            localStorage.setItem("cart", JSON.stringify(minimizedCart));
        } catch (e) {
            console.error("Local Storage Quota Exceeded", e);
        }
    };

    const addToCart = (p: Product, variant?: string, qty = 1) => {
        setCart((prev) => {
            const existing = prev.find((i) => i.id === p.id && i.selectedVariant === variant);
            let newCart;
            if (existing) {
                newCart = prev.map((i) => (i.id === p.id && i.selectedVariant === variant ? { ...i, qty: i.qty + qty, price: p.price } : i));
            } else {
                newCart = [...prev, { ...p, qty, selectedVariant: variant }];
            }
            saveCartToLocal(newCart);
            return newCart;
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (id: string, variant?: string) => {
        setCart((prev) => {
            const newCart = prev.filter((i) => !(i.id === id && i.selectedVariant === variant));
            saveCartToLocal(newCart);
            return newCart;
        });
    };

    const updateCartQty = (id: string, qty: number, variant?: string) => {
        if (qty < 1) return removeFromCart(id, variant);
        setCart((prev) => {
            const newCart = prev.map((i) => (i.id === id && i.selectedVariant === variant ? { ...i, qty } : i));
            saveCartToLocal(newCart);
            return newCart;
        });
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem("cart");
    };

    // --- SHIPPING RATES ---
    const addShippingRate = async (rate: ShippingRate) => {
        try {
            await setDoc(doc(db, "shipping_rates", rate.id), rate);
        } catch (e) {
            console.error("Error adding shipping rate", e);
        }
    };

    const updateShippingRate = async (id: string, rate: Partial<ShippingRate>) => {
        try {
            await updateDoc(doc(db, "shipping_rates", id), rate);
        } catch (e) {
            console.error("Error updating shipping rate", e);
        }
    };

    const deleteShippingRate = async (id: string) => {
        try {
            await deleteDoc(doc(db, "shipping_rates", id));
        } catch (e) {
            console.error("Error deleting shipping rate", e);
        }
    };

    const getShippingCost = (city: string): number => {
        if (!city) return 0;
        const rate = shippingRates.find(r => r.city.toLowerCase() === city.toLowerCase());
        if (rate) return rate.price;
        const defaultRate = shippingRates.find(r => r.isDefault);
        return defaultRate ? defaultRate.price : 0;
    };

    // --- SEARCH & PRICE FILTER ---
    const filteredProducts = products.filter(p => {
        const query = searchQuery.toLowerCase();
        const price = Number(p.price);

        // Price filter
        const priceMatch = price >= priceFilter.min && price <= priceFilter.max;
        if (!priceMatch) return false;

        // Handle title - could be string or object {ar, en, fr}
        let titleMatch = false;
        if (typeof p.title === 'string') {
            titleMatch = p.title.toLowerCase().includes(query);
        } else if (typeof p.title === 'object' && p.title !== null) {
            const titleObj = p.title as any;
            titleMatch = Object.values(titleObj).some(val =>
                typeof val === 'string' && val.toLowerCase().includes(query)
            );
        }

        // Handle category
        const categoryMatch = typeof p.category === 'string'
            ? p.category.toLowerCase().includes(query)
            : false;

        return titleMatch || categoryMatch;
    });

    return (
        <ShopContext.Provider
            value={{
                products,
                categories,
                customers,
                orders,
                cart,
                settings,
                shippingRates,
                blogs,
                addToCart,
                updateCartQty,
                removeFromCart,
                clearCart,
                addProduct,
                updateProduct,
                deleteProduct,
                addCategory,
                deleteCategory,
                addBlog,
                updateBlog,
                deleteBlog,
                updateSettings,
                addShippingRate,
                updateShippingRate,
                deleteShippingRate,
                getShippingCost,
                searchQuery,
                setSearchQuery,
                priceFilter,
                setPriceFilter,
                getFilteredProducts,
                filteredProducts,
                isStoreActive,
                isCartOpen,
                openCart,
                closeCart,
                isCheckoutOpen,
                openCheckout,
                closeCheckout
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
