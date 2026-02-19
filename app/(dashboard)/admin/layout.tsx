import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import { ShopProvider } from "@/context/ShopContext";
import { Toaster } from "sonner";
import { NextIntlClientProvider } from 'next-intl';
import "../../globals.css";

// Firebase (Server-Side)
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

// Static imports for translation files
import arMessages from "@/messages/ar.json";
import enMessages from "@/messages/en.json";
import frMessages from "@/messages/fr.json";

const tajawal = Tajawal({
    subsets: ["arabic"],
    weight: ["300", "400", "500", "700", "900"],
    variable: "--font-tajawal",
});

export const metadata: Metadata = {
    title: "Next Shop | Admin",
    description: "Admin Panel",
};

export default async function AdminRootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // 🌍 Fetch System Language (Default to 'ar')
    let lang = 'ar';
    let dir = 'rtl';
    let messages = arMessages;

    // ⚠️ Phase 1 Fix: Hardcoded to Arabic to prevent 10s Timeout on Server
    // try {
    //     // Direct Firestore fetch (Admin Mode)
    //     // const settingsRef = doc(db, "settings", "general");
    //     // const snap = await getDoc(settingsRef);
    //     // if (snap.exists()) {
    //     //     const data = snap.data();
    //     //     if (data.default_locale) {
    //     //         lang = data.default_locale;
    //     //         dir = lang === 'ar' ? 'rtl' : 'ltr';
    //     //     }
    //     // }
    //     // // Load messages based on locale
    //     // if (lang === 'en') {
    //     //     messages = enMessages;
    //     // } else if (lang === 'fr') {
    //     //     messages = frMessages;
    //     // } else {
    //     //     messages = arMessages;
    //     // }
    // } catch (e) {
    //     console.error("Layout Fetch Error:", e);
    //     // Fallback to Arabic messages
    //     messages = arMessages;
    // }

    return (
        <html lang={lang} dir={dir} suppressHydrationWarning>
            <body className={`${tajawal.className} bg-gray-50 text-gray-900 antialiased`} suppressHydrationWarning>
                <NextIntlClientProvider messages={messages} locale={lang}>
                    <ShopProvider>
                        {children}
                        <Toaster position="top-center" richColors />
                    </ShopProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
