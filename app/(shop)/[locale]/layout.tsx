import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Tajawal } from "next/font/google";
import "../../globals.css";

import { LocaleLayoutClient } from "./LocaleLayoutClient";

const tajawal = Tajawal({
    subsets: ["arabic"],
    weight: ["300", "400", "500", "700", "900"],
    variable: "--font-tajawal",
});

export const metadata = {
    title: "Luxe Store | أفضل منتجات بجودة عالية",
    description: "وجهتكم الأولى للتسوق الإلكتروني. نقدم لكم أفضل المنتجات بجودة عالية وتوصيل سريع. اكتشفوا تشكيلتنا الحصرية في Luxe Store.",
    openGraph: {
        images: ['/store-preview.png'],
    },
    twitter: {
        card: "summary_large_image",
        images: ['/store-preview.png'],
    },
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
                <LocaleLayoutClient locale={locale} messages={messages}>
                    {children}
                </LocaleLayoutClient>
            </body>
        </html>
    );
}
