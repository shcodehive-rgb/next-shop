"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useLocale } from 'next-intl';

interface HeroBannerProps {
    image: string;
}

export default function HeroBanner({ image }: HeroBannerProps) {
    const [loaded, setLoaded] = useState(false);
    const locale = useLocale();
    const isAr = locale === 'ar';

    return (
        <div className="w-full relative">
            <div className="relative aspect-[16/6] md:aspect-[16/5] overflow-hidden bg-gray-100">

                {/* Skeleton shimmer — always visible until image loads */}
                <div
                    className={`absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse transition-opacity duration-200 ${loaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                />

                {/* Real image — priority loading with no artificial delay */}
                {image && (
                    <Image
                        src={image}
                        alt="LUXEFIT - Excellence Sportive"
                        fill
                        className="object-cover w-full h-full"
                        priority
                        sizes="100vw"
                        onLoad={() => setLoaded(true)}
                    />
                )}

                {/* CTA Button - Positioned in the specific empty area */}
                <div className="absolute inset-0">
                    <div
                        className="absolute"
                        style={{
                            top: '72%',
                            right: '22%',
                            transform: 'translateX(50%)'
                        }}
                    >
                        <Link
                            href={`/${locale}/collections/all`}
                            className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-light tracking-wider text-sm uppercase transition-all duration-300 hover:bg-white hover:text-black hover:shadow-xl transform hover:scale-105 rounded-sm"
                        >
                            {isAr ? 'تسوق الآن' : 'SHOP NOW'}
                        </Link>
                    </div>
                </div>

                {/* Minimal gradient overlay for button visibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"></div>
            </div>
        </div>
    );
}
