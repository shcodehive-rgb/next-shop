"use client";

import { useShop } from "@/context/ShopContext";
import { useEffect, useState } from "react";

export default function TopAnnouncement() {
    const { settings } = useShop();
    const [index, setIndex] = useState(0);

    // Ensure announcements is an array and filter out empty strings
    const announcements = Array.isArray(settings.announcements)
        ? settings.announcements.filter((t: string) => t.trim() !== "")
        : [];

    useEffect(() => {
        if (announcements.length > 1) {
            const interval = setInterval(() => {
                setIndex((prev) => (prev + 1) % announcements.length);
            }, 3500);
            return () => clearInterval(interval);
        }
    }, [announcements.length]);

    if (!announcements.length) return null;

    return (
        <div className="bg-gray-900 text-white text-xs md:text-sm font-medium py-2.5 text-center relative z-[60] overflow-hidden dir-rtl border-b border-white/20">
            <div className="container mx-auto px-4 relative h-5">
                {announcements.map((text: string, i: number) => (
                    <div
                        key={i}
                        className={`absolute w-full top-0 left-0 transition-all duration-500 ease-in-out transform flex items-center justify-center gap-2 ${i === index
                            ? "translate-y-0 opacity-100"
                            : "translate-y-full opacity-0"
                            }`}
                        style={{ pointerEvents: i === index ? 'auto' : 'none' }}
                    >
                        <span>{text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
