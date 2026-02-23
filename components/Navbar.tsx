"use client";

import { useShop } from "@/context/ShopContext";
import { ShoppingCart, Lock, Search, Menu, ChevronDown, X } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { useTranslations, useLocale } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getCategoryTitle } from "@/lib/utils";

export default function Navbar() {
    const { settings, cart, searchQuery, setSearchQuery, openCart, categories } = useShop();
    const router = useRouter();
    const pathname = usePathname();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const t = useTranslations('Navbar');
    const locale = useLocale();

    // Admin Login Removed for Storefront Public Access

    // Auto focus when opening search
    useEffect(() => {
        if (isSearchOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isSearchOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProductsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    return (
        <header className="w-full bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">

                {/* Left Side: Mobile Menu & Logo */}
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                    >
                        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
                            placeholder={t('search_placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-full py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        />
                        <Search className="w-5 h-5 text-gray-400 absolute ltr:right-3 rtl:left-3 top-2.5" />
                    </div>
                </div>

                {/* Center: Navigation Menu (Desktop) */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link 
                        href="/" 
                        className="text-gray-700 hover:text-emerald-600 font-medium transition-colors"
                    >
                        {locale === 'ar' ? 'الرئيسية' : 'Home'}
                    </Link>
                    
                    {/* Products Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onMouseEnter={() => setIsProductsDropdownOpen(true)}
                            onClick={() => setIsProductsDropdownOpen(!isProductsDropdownOpen)}
                            className="flex items-center gap-1 text-gray-700 hover:text-emerald-600 font-medium transition-colors"
                        >
                            {locale === 'ar' ? 'المنتجات' : 'Products'}
                            <ChevronDown className={`w-4 h-4 transition-transform ${isProductsDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isProductsDropdownOpen && (
                            <div 
                                className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg py-2"
                                onMouseLeave={() => setIsProductsDropdownOpen(false)}
                            >
                                {categories && categories.length > 0 ? (
                                    categories.map((category) => (
                                        <Link
                                            key={category.id}
                                            href={`/${locale}/collection/${category.id}`}
                                            className="block px-4 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                                        >
                                            {getCategoryTitle(category.name, locale)}
                                        </Link>
                                    ))
                                ) : (
                                    <div className="px-4 py-2 text-gray-500 text-sm">
                                        {locale === 'ar' ? 'لا توجد فئات' : 'No categories available'}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    <Link 
                        href="/blog" 
                        className="text-gray-700 hover:text-emerald-600 font-medium transition-colors"
                    >
                        {locale === 'ar' ? 'المدونة' : 'Blog'}
                    </Link>
                </nav>

                {/* Right Side: Search & Icons */}
                <div className="flex items-center gap-3">

                    {/* Language Switcher */}
                    <LanguageSwitcher />

                    {/* Mobile Search */}
                    <button
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className="md:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-full"
                    >
                        <Search className="w-5 h-5" />
                    </button>

                    {/* Admin Lock - REMOVED for Public Storefront */}

                    {/* Cart */}
                    <button
                        onClick={openCart}
                        className="relative p-2 text-gray-600 hover:text-emerald-600 transition-colors"
                        title={t('cart')}
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

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white">
                    <nav className="container mx-auto px-4 py-4 space-y-2">
                        <Link 
                            href="/" 
                            className="block py-2 text-gray-700 hover:text-emerald-600 font-medium transition-colors"
                        >
                            {locale === 'ar' ? 'الرئيسية' : 'Home'}
                        </Link>
                        
                        {/* Mobile Products Section */}
                        <div className="py-2">
                            <button
                                onClick={() => setIsProductsDropdownOpen(!isProductsDropdownOpen)}
                                className="flex items-center gap-1 text-gray-700 hover:text-emerald-600 font-medium transition-colors w-full"
                            >
                                {locale === 'ar' ? 'المنتجات' : 'Products'}
                                <ChevronDown className={`w-4 h-4 transition-transform ${isProductsDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {isProductsDropdownOpen && (
                                <div className="mt-2 pl-4 space-y-1">
                                    {categories && categories.length > 0 ? (
                                        categories.map((category) => (
                                            <Link
                                                key={category.id}
                                                href={`/${locale}/collection/${category.id}`}
                                                className="block py-2 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors rounded"
                                            >
                                                {getCategoryTitle(category.name, locale)}
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="py-2 text-gray-500 text-sm">
                                            {locale === 'ar' ? 'لا توجد فئات' : 'No categories available'}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        <Link 
                            href="/blog" 
                            className="block py-2 text-gray-700 hover:text-emerald-600 font-medium transition-colors"
                        >
                            {locale === 'ar' ? 'المدونة' : 'Blog'}
                        </Link>
                    </nav>
                </div>
            )}

            {/* Mobile Search Bar */}
            {isSearchOpen && (
                <div className="md:hidden border-t border-gray-100 bg-gray-50 px-4 py-3">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={t('search_placeholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-full py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                </div>
            )}
        </header>
    );
}
