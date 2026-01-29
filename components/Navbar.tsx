"use client";

import { useShop } from "@/context/ShopContext";
import { ShoppingCart, Lock, Search, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
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
        <header className="w-full bg-white shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                
                {/* Left Side: Menu & Logo */}
                <div className="flex items-center gap-4">
                    <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-full md:hidden">
                        <Menu className="w-5 h-5" />
                    </button>
                    <Link href="/" className="text-lg font-bold text-gray-800 tracking-tight">
                        {settings.storeName}
                    </Link>
                </div>

                {/* Center: Search Bar (Hidden on mobile) */}
                <div className="hidden md:flex flex-1 max-w-md mx-8">
                    <div className="relative w-full">
                        <input 
                            type="text" 
                            placeholder="ابحث عن منتج..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-full py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right text-sm"
                        />
                        <Search className="w-5 h-5 text-gray-400 absolute right-3 top-2.5" />
                    </div>
                </div>

                {/* Right Side: Icons */}
                <div className="flex items-center gap-3">
                    
                    {/* Mobile Search */}
                    <button 
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className="md:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-full"
                    >
                        <Search className="w-5 h-5" />
                    </button>

                    {/* Admin Lock */}
                    <button 
                        onClick={handleAdminLogin}
                        className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-full transition"
                        title="Admin"
                    >
                        <Lock className="w-5 h-5" />
                    </button>

                    {/* Cart */}
                    <button
                        onClick={onOpenCart}
                        className="relative p-2 text-gray-600 hover:text-emerald-600 transition-colors"
                        title="Cart"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        {cart.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                                {cart.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Search Bar */}
            {isSearchOpen && (
                <div className="md:hidden border-t border-gray-100 bg-gray-50 px-4 py-3">
                    <input 
                        ref={inputRef}
                        type="text" 
                        placeholder="ابحث عن منتج..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-full py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right text-sm"
                    />
                </div>
            )}
        </header>
    );
}
