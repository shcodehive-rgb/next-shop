import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Tajawal } from "next/font/google";
import { ShopProvider } from "@/context/ShopContext";
import { Toaster } from "sonner";
import "../../globals.css";

import StoreLayout from "@/components/StoreLayout";
import Analytics from "@/components/Analytics";
import WhatsAppButton from "@/components/WhatsAppButton";
import StoreProtectedWrapper from "@/components/StoreProtectedWrapper";
import ScrollToTop from "@/components/ScrollToTop";
import FacebookPixel from "@/components/FacebookPixel";
import TikTokPixel from "@/components/TikTokPixel";

const tajawal = Tajawal({
    subsets: ["arabic"],
    weight: ["300", "400", "500", "700", "900"],
    variable: "--font-tajawal",
});

export const metadata = {
    title: "Next Shop | Premium E-commerce",
    description: "The best place to shop online.",
    verification: {
        google: "QQ75Z1qsvcfpD-e_SmARENQNgnEAP6iz6UqNbzBELRo",
    },
};

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    // Ensure valid locale
    if (!['ar', 'en', 'fr'].includes(locale)) {
        notFound();
    }

    // Provide all messages to the client
    const messages = await getMessages();
    const dir = locale === 'ar' ? 'rtl' : 'ltr';

    return (
        <html lang={locale} dir={dir}>
            <head>
                <meta name="facebook-domain-verification" content="xx54atu8vrt2wxv5202ru235c6kra1" />
            </head>
            <body className={`${tajawal.className} bg-white text-gray-900 antialiased`}>
                <NextIntlClientProvider messages={messages}>
                    <ShopProvider>
                        <StoreProtectedWrapper>
                            <FacebookPixel />
                            <TikTokPixel />
                            <Analytics />
                            <StoreLayout>
                                {children}
                            </StoreLayout>
                            <WhatsAppButton />
                            <ScrollToTop />
                        </StoreProtectedWrapper>
                        <Toaster position="top-center" richColors />
                    </ShopProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
