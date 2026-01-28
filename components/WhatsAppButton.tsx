"use client";

import { useShop } from "@/context/ShopContext";
import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
    const { settings } = useShop();

    if (!settings.phoneNumber) return null;

    // Clean phone number (remove + or spaces)
    const cleanPhone = settings.phoneNumber.replace(/[^0-9]/g, '');

    return (
        <a
            href={`https://wa.me/${cleanPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-40 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 hover:shadow-xl transition-all animate-in zoom-in slide-in-from-bottom-4 duration-500 flex items-center justify-center"
            title="Chat on WhatsApp"
        >
            <MessageCircle className="w-8 h-8 fill-current" />
        </a>
    );
}
