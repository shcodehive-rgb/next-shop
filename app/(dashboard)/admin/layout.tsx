"use client";

import { Tajawal } from "next/font/google";
import { ShopProvider } from "@/context/ShopContext";
import { Toaster } from "sonner";
import { NextIntlClientProvider } from 'next-intl';
import "../../globals.css";

// Static imports for translation files
import arMessages from "@/messages/ar.json";

const tajawal = Tajawal({
    subsets: ["arabic"],
    weight: ["300", "400", "500", "700", "900"],
    variable: "--font-tajawal",
});

export default function AdminRootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const lang = 'ar';
    const dir = 'rtl';
    const messages = arMessages;

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
