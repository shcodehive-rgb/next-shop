"use client";

import { useShop } from "@/context/ShopContext";
import { Facebook, Instagram, Heart, ShieldCheck, Truck, Scale, Phone } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Footer() {
    const { settings } = useShop();
    const t = useTranslations('Footer'); // Ensure you have translations or use hardcoded Arabic if preferred by user request "Arabic Footer"

    return (
        <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 font-tajawal border-t border-gray-800">
            <div className="container mx-auto px-6 max-w-6xl">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 text-center md:text-right">

                    {/* BRAND COL */}
                    <div className="space-y-4">
                        <Link href="/" className="text-2xl font-black text-white block hover:text-emerald-400 transition">
                            {settings.storeName}
                        </Link>
                        <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto md:mx-0">
                            {settings.storeName} - وجهتكم الأولى للتسوق الإلكتروني. نقدم لكم أفضل المنتجات بجودة عالية وخدمة توصيل سريعة.
                        </p>
                        <div className="flex gap-4 justify-center md:justify-start pt-2">
                            <a href="https://www.facebook.com/profile.php?id=61579754581519" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-gray-800 rounded-lg hover:bg-emerald-600 hover:text-white transition group">
                                <Facebook className="w-5 h-5 group-hover:scale-110 transition" />
                            </a>
                            <a href="https://www.instagram.com/luxestore2026/" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-gray-800 rounded-lg hover:bg-emerald-600 hover:text-white transition group">
                                <Instagram className="w-5 h-5 group-hover:scale-110 transition" />
                            </a>
                        </div>
                    </div>

                    {/* COL 1: Quick Links */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6 relative inline-block">
                            روابط سريعة
                            <span className="absolute -bottom-2 right-0 w-12 h-1 bg-emerald-500 rounded-full"></span>
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/" className="hover:text-emerald-400 transition flex items-center justify-center md:justify-start gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition"></span>
                                    الصفحة الرئيسية
                                </Link>
                            </li>
                            <li>
                                <Link href="/#products" className="hover:text-emerald-400 transition flex items-center justify-center md:justify-start gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition"></span>
                                    المنتجات
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:text-emerald-400 transition flex items-center justify-center md:justify-start gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition"></span>
                                    تواصل معنا
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* COL 2: Our Policies */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6 relative inline-block">
                            سياساتنا
                            <span className="absolute -bottom-2 right-0 w-12 h-1 bg-emerald-500 rounded-full"></span>
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/policies/refund" className="hover:text-emerald-400 transition flex items-center justify-center md:justify-start gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition"></span>
                                    سياسة الإرجاع والاستبدال
                                </Link>
                            </li>
                            <li>
                                <Link href="/policies/privacy" className="hover:text-emerald-400 transition flex items-center justify-center md:justify-start gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition"></span>
                                    سياسة الخصوصية
                                </Link>
                            </li>
                            <li>
                                <Link href="/policies/cod" className="hover:text-emerald-400 transition flex items-center justify-center md:justify-start gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition"></span>
                                    سياسة الدفع عند الاستلام
                                </Link>
                            </li>
                            <li>
                                <Link href="/policies/shipping" className="hover:text-emerald-400 transition flex items-center justify-center md:justify-start gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition"></span>
                                    سياسة الشحن والتوصيل
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
                    <p>© {new Date().getFullYear()} {settings.storeName}. جميع الحقوق محفوظة.</p>

                    <div className="flex items-center gap-1">
                        <span>Made with</span>
                        <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
                        <span>by</span>
                        <span className="text-white font-bold">AminaPlatform</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
