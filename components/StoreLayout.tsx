"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CheckoutModal from "@/components/shop/CheckoutModal";
import CartDrawer from "@/components/shop/CartDrawer";

import TopAnnouncement from "@/components/TopAnnouncement";

import { useShop } from "@/context/ShopContext";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname.startsWith("/admin");
    const { isCheckoutOpen, closeCheckout } = useShop();

    // Admin pages handle their own layout for now (or full screen)
    if (isAdmin) {
        return <>{children}</>;
    }

    // Store Layout (Sticky Footer)
    return (
        <div className="min-h-screen flex flex-col">
            <TopAnnouncement />
            <Navbar />
            <CartDrawer />
            <main className="flex-grow flex flex-col">
                {children}
            </main>
            <Footer />
            <CheckoutModal isOpen={isCheckoutOpen} onClose={closeCheckout} />
        </div>
    );
}
