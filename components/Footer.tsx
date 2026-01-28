"use client";

import { useShop } from "@/context/ShopContext";
import { Facebook, Instagram, Phone, MapPin, Heart } from "lucide-react";
import Link from "next/link";

export default function Footer() {
    const { settings } = useShop();

    return (
        <footer className="font-tajawal mt-12 pb-8 bg-gray-900 text-center text-gray-300">

            {/* Seamless Content Area */}
            <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 pb-8 text-center md:text-right border-b border-gray-800 mb-6">

                {/* Brand - Subtle */}
                <div>
                    <h2 className="text-xl font-black text-white mb-2">{settings.storeName}</h2>
                    <p className="text-gray-400 text-xs leading-relaxed">
                        وجهتك الأولى للتسوق الإلكتروني. جودة، ضمان، وسرعة في التوصيل.
                    </p>
                </div>

                {/* Quick Links - Compact */}
                <div className="flex flex-col gap-2 text-sm">
                    <h3 className="font-bold text-emerald-400 mb-1">روابط سريعة</h3>
                    <div className="flex flex-col gap-1 text-gray-400">
                        <Link href="/" className="hover:text-white transition">الرئيسية</Link>
                        <Link href="/admin" className="hover:text-white transition">لوحة التحكم</Link>
                    </div>
                </div>

                {/* Socials - Clean */}
                <div className="flex flex-col items-center md:items-start gap-2">
                    <h3 className="font-bold text-emerald-400 mb-1">تابعنا</h3>
                    <div className="flex gap-4">
                        <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-emerald-600 hover:text-white transition"><Facebook className="w-4 h-4" /></a>
                        <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-emerald-600 hover:text-white transition"><Instagram className="w-4 h-4" /></a>
                    </div>
                </div>
            </div>

            {/* Copyright - Very Subtle & Close */}
            <div className="text-gray-500 text-[10px] flex flex-col items-center gap-2">
                <p>حقوق النشر محفوظة © {new Date().getFullYear()} {settings.storeName}</p>
                <p className="flex items-center gap-1 opacity-80">
                    Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> by
                    <a href="https://github.com/amina-platform" className="text-emerald-400 font-bold hover:underline">
                        AminaPlatform
                    </a>
                </p>
            </div>
        </footer>
    );
}
