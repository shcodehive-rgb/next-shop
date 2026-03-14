"use client";

import Link from "next/link";
import { useShop } from "@/context/ShopContext";

export default function CategoryGrid() {
    const { settings } = useShop();

    // Get all 3 banners
    const banners = [
        {
            image: (settings as any).categoryBanner1Image,
            label: (settings as any).categoryBanner1Label,
            link: (settings as any).categoryBanner1Link,
        },
        {
            image: (settings as any).categoryBanner2Image,
            label: (settings as any).categoryBanner2Label,
            link: (settings as any).categoryBanner2Link,
        },
        {
            image: (settings as any).categoryBanner3Image,
            label: (settings as any).categoryBanner3Label,
            link: (settings as any).categoryBanner3Link,
        },
    ];

    // Filter out banners without images
    const activeBanners = banners.filter(b => b.image);

    if (activeBanners.length === 0) return null;

    return (
        <section className="py-12 px-4">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {activeBanners.map((banner, index) => (
                        <Link
                            key={index}
                            href={banner.link || "#"}
                            className="group relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl h-[500px] md:h-[600px]"
                        >
                            {/* Image */}
                            <img
                                src={banner.image}
                                alt={banner.label || `Category ${index + 1}`}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />

                            {/* Overlay for text */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                            {/* Label at bottom */}
                            {banner.label && (
                                <div className="absolute bottom-0 left-0 right-0 p-8">
                                    <div className="inline-block transform transition-transform duration-500 group-hover:translate-x-1">
                                        <span className="font-light text-2xl text-white tracking-[0.2em] uppercase">
                                            {banner.label}
                                        </span>
                                        <div className="h-[1px] w-12 bg-white/50 mt-2 transition-all duration-500 group-hover:w-full" />
                                    </div>
                                </div>
                            )}

                            {/* Hover effect */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
