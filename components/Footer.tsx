"use client";

import { useShop } from "@/context/ShopContext";
import { Facebook, Instagram, Phone, MapPin, Heart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useTranslations } from "next-intl";

export default function Footer() {
    const { settings } = useShop();
    const [cmsPages, setCmsPages] = useState<any[]>([]);
    const t = useTranslations('Footer');
    const tNavbar = useTranslations('Navbar');

    useEffect(() => {
        getDocs(collection(db, "pages")).then(snap => {
            setCmsPages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
    }, []);

    return (
        <footer className="font-tajawal mt-12 pb-8 bg-gray-900 text-center text-gray-300">

            {/* Seamless Content Area */}
            <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 pb-8 text-center md:text-right border-b border-gray-800 mb-6">

                {/* Brand - Subtle */}
                <div>
                    <h2 className="text-xl font-black text-white mb-2">{settings.storeName}</h2>
                    <p className="text-gray-400 text-xs leading-relaxed">
                        {t('description')}
                    </p>
                </div>

                {/* Quick Links - Compact */}
                <div className="flex flex-col gap-2 text-sm">
                    <h3 className="font-bold text-emerald-400 mb-1">{t('quick_links')}</h3>
                    <div className="flex flex-col gap-1 text-gray-400">
                        <Link href="/" className="hover:text-white transition">{tNavbar('home')}</Link>
                        <Link href="/admin" className="hover:text-white transition">{tNavbar('admin')}</Link>
                    </div>
                </div>

                {/* Pages (Dynamic CMS) */}
                <div className="flex flex-col gap-2 text-sm">
                    <h3 className="font-bold text-emerald-400 mb-1">{t('information')}</h3>
                    <div className="flex flex-col gap-1 text-gray-400">
                        {cmsPages.map(page => (
                            <Link key={page.id} href={`/pages/${page.slug}`} className="hover:text-white transition">
                                {page.title}
                            </Link>
                        ))}
                        {cmsPages.length === 0 && <span className="text-gray-600 text-xs">...</span>}
                    </div>
                </div>

                {/* Socials - Clean */}
                <div className="flex flex-col items-center md:items-start gap-2">
                    <h3 className="font-bold text-emerald-400 mb-1">{t('follow_us')}</h3>
                    <div className="flex gap-4">
                        <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-emerald-600 hover:text-white transition"><Facebook className="w-4 h-4" /></a>
                        <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-emerald-600 hover:text-white transition"><Instagram className="w-4 h-4" /></a>
                    </div>
                </div>
            </div>

            {/* Copyright - Very Subtle & Close */}
            <div className="text-gray-500 text-[10px] flex flex-col items-center gap-2">
                <p>{t('rights')} © {new Date().getFullYear()} {settings.storeName}</p>
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
