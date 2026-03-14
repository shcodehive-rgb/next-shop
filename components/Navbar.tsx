"use client";

import { useShop } from "@/context/ShopContext";
import { ShoppingCart, Lock, Search, Menu, ChevronDown, X, Truck } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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

    // Navigate to products page when search is submitted
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        router.push(`/${locale}/products`);
    };

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
        <header className="w-full bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">

                {/* Left Side: Logo */}
                <Link href="/" className="flex items-center">
                    <div className="relative w-16 h-10 flex items-center">
                        <Image
                            src="/logo.svg"
                            alt="LUXEFIT"
                            width={64}
                            height={40}
                            className="object-contain"
                        />
                    </div>
                </Link>

                {/* Center: Empty space for luxury aesthetic */}
                <div className="hidden lg:flex flex-1 justify-center"></div>

                {/* Right Side: Navigation */}
                <nav className="hidden lg:flex items-center gap-8">
                    <Link
                        href="/"
                        className="text-black hover:text-emerald-600 font-light tracking-wider text-sm uppercase transition-colors"
                    >
                        {locale === 'ar' ? 'الرئيسية' : 'HOME'}
                    </Link>

                    <Link
                        href={`/${locale}/collections/equipements`}
                        className="text-black hover:text-emerald-600 font-light tracking-wider text-sm uppercase transition-colors"
                    >
                        {locale === 'ar' ? 'معدات وإكسسوارات' : 'ÉQUIPEMENTS & ACCESSOIRES'}
                    </Link>

                    <Link
                        href={`/${locale}/collections/packs-offres`}
                        className="text-black hover:text-emerald-600 font-light tracking-wider text-sm uppercase transition-colors"
                    >
                        {locale === 'ar' ? 'باقات وعروض' : 'PACKS & OFFRES'}
                    </Link>

                    <Link
                        href={`/${locale}/collections/arts-martiaux`}
                        className="text-black hover:text-emerald-600 font-light tracking-wider text-sm uppercase transition-colors"
                    >
                        {locale === 'ar' ? 'فنون قتالية' : 'ARTS MARTIAUX'}
                    </Link>

                    <Link
                        href={`/${locale}/track-order`}
                        className="text-black hover:text-emerald-600 font-light tracking-wider text-sm uppercase transition-colors"
                    >
                        <Truck className="w-4 h-4 inline-block mr-2" />
                        {locale === 'ar' ? 'تتبع الطلب' : 'TRACK ORDER'}
                    </Link>
                </nav>

                {/* Right Side: Search & Cart */}
                <div className="flex items-center gap-4">
                    {/* Language Switcher */}
                    <LanguageSwitcher />

                    {/* Search Icon */}
                    <button
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className="p-2 text-gray-600 hover:text-emerald-600 transition-colors"
                        aria-label="Search"
                    >
                        <Search className="w-5 h-5" />
                    </button>

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

                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="lg:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Search Overlay */}
            {isSearchOpen && (
                <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
                    <div className="w-full max-w-md mx-4 px-4">
                        <form onSubmit={(e) => { handleSearch(e); setIsSearchOpen(false); }} className="relative">
                            <div className="relative">
                                <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder={t('search_placeholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                />
                                <button type="submit" className="absolute right-3 top-3 text-gray-400 hover:text-emerald-600 transition-colors">
                                    <Search className="w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 bg-white z-50 pt-20">
                    <nav className="container mx-auto px-6 py-8 space-y-6">
                        <Link
                            href="/"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block py-3 text-gray-700 hover:text-emerald-600 font-bold tracking-wider text-sm uppercase transition-colors border-b border-gray-50"
                        >
                            {locale === 'ar' ? 'الرئيسية' : 'HOME'}
                        </Link>

                        <Link
                            href={`/${locale}/collections/all`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block py-3 text-gray-700 hover:text-emerald-600 font-bold tracking-wider text-sm uppercase transition-colors border-b border-gray-50"
                        >
                            {locale === 'ar' ? 'جميع المنتجات' : 'TOUS LES PRODUITS'}
                        </Link>


                        <Link
                            href={`/${locale}/collections/equipements`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block py-3 text-gray-700 hover:text-emerald-600 font-bold tracking-wider text-sm uppercase transition-colors border-b border-gray-50"
                        >
                            {locale === 'ar' ? 'معدات وإكسسوارات' : 'ÉQUIPEMENTS & ACCESSOIRES'}
                        </Link>

                        <Link
                            href={`/${locale}/collections/packs-offres`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block py-3 text-gray-700 hover:text-emerald-600 font-bold tracking-wider text-sm uppercase transition-colors border-b border-gray-50"
                        >
                            {locale === 'ar' ? 'باقات وعروض' : 'PACKS & OFFRES'}
                        </Link>

                        <Link
                            href={`/${locale}/collections/arts-martiaux`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block py-3 text-gray-700 hover:text-emerald-600 font-bold tracking-wider text-sm uppercase transition-colors border-b border-gray-50"
                        >
                            {locale === 'ar' ? 'فنون قتالية' : 'ARTS MARTIAUX'}
                        </Link>

                        <Link
                            href={`/${locale}/track-order`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block py-3 text-gray-700 hover:text-emerald-600 font-bold tracking-wider text-sm uppercase transition-colors"
                        >
                            <Truck className="w-4 h-4 inline-block mr-2" />
                            {locale === 'ar' ? 'تتبع الطلب' : 'TRACK ORDER'}
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
}
