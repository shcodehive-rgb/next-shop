"use client";

import { ShopProvider } from "@/context/ShopContext";

export default function BlogLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ShopProvider>
            {children}
        </ShopProvider>
    );
}
