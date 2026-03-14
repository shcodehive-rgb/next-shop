"use client";

import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { ShopProvider } from "@/context/ShopContext";
import { Toaster } from "sonner";
import StoreLayout from "@/components/StoreLayout";
import Analytics from "@/components/Analytics";
import WhatsAppButton from "@/components/WhatsAppButton";
import StoreProtectedWrapper from "@/components/StoreProtectedWrapper";
import ScrollToTop from "@/components/ScrollToTop";
import FacebookPixel from "@/components/FacebookPixel";
import TikTokPixel from "@/components/TikTokPixel";

interface LocaleLayoutClientProps {
    locale: string;
    messages: any;
    children: ReactNode;
}

export function LocaleLayoutClient({ locale, messages, children }: LocaleLayoutClientProps) {
    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            <ShopProvider>
                <StoreProtectedWrapper>
                    <FacebookPixel />
                    <TikTokPixel />
                    <Analytics />
                    <StoreLayout>
                        {children}
                    </StoreLayout>
                    <ScrollToTop />
                    <WhatsAppButton />
                </StoreProtectedWrapper>
                <Toaster position="top-center" />
            </ShopProvider>
        </NextIntlClientProvider>
    );
}
