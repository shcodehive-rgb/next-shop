"use client";

import { useShop } from "@/context/ShopContext";
import { ShoppingCart, Lock, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";

export default function Navbar({ onOpenCart }: { onOpenCart: () => void }) {
    const { settings, cart, searchQuery, setSearchQuery } = useShop();
    const router = useRouter();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleAdminLogin = async () => {
        const { value: pin } = await Swal.fire({
            title: "Admin Access",
            input: "password",
            inputLabel: "Enter PIN",
            inputPlaceholder: "1234",
            showCancelButton: true,
            confirmButtonColor: "#10b981",
            cancelButtonText: "Cancel"
        });

        if (pin === "1234") {
            router.push("/admin");
        } else if (pin) {
            Swal.fire("Error", "Wrong PIN", "error");
        }
    };

    // Auto focus when opening search
    useEffect(() => {
        if (isSearchOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isSearchOpen]);

    return (
        <header className="fixed top-0 inset-x-0 z-50 px-4 py-4 transition-all duration-300">
            <div className={`max-w-4xl mx-auto bg-white/80 backdrop-blur-xl border border-white/50 shadow-lg shadow-emerald-900/5 rounded-2xl flex items-center transition-all duration-300 ${isSearchOpen ? "px-4 py-2" : "px-6 py-3 justify-between"}`}>

                {/* SEARCH MODE */}
                {isSearchOpen ? (
                    <div className="flex-1 flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                        <Search className="w-5 h-5 text-gray-400" />
                        <input
                            ref={inputRef}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="ابحث عن منتج..."
                            className="flex-1 bg-transparent border-none outline-none font-bold text-gray-700 placeholder-gray-400 h-10"
                        />
                        <button
                            onClick={() => {
                                setIsSearchOpen(false);
                                setSearchQuery("");
                            }}
                            className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
                            title="Close Search"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    /* DEFAULT MODE */
                    <>
                        {/* Logo / Name */}
                        <h1 className="text-xl font-black text-gray-900 truncate max-w-[200px] tracking-tight">
                            {settings.storeName}
                        </h1>

                        <div className="flex gap-2 items-center">
                            {/* Search Trigger */}
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="p-2.5 rounded-xl text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 transition"
                                title="Search"
                            >
                                <Search className="w-5 h-5" />
                            </button>

                            {/* Secret Admin */}
                            <button
                                onClick={handleAdminLogin}
                                className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100/50 transition duration-200"
                                title="Admin Login"
                            >
                                <Lock className="w-5 h-5" />
                            </button>

                            {/* Cart Badge */}
                            <button
                                onClick={onOpenCart}
                                className="relative p-2.5 bg-gray-100/80 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 group"
                                style={{ color: cart.length > 0 ? settings.primaryColor : undefined }}
                                title="Open Cart"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                {cart.length > 0 && (
                                    <span
                                        className="absolute -top-1 -right-1 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm ring-2 ring-white animate-in zoom-in"
                                        style={{ backgroundColor: settings.primaryColor || '#10b981' }}
                                    >
                                        {cart.length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </>
                )}

            </div>
        </header>
    );
}
