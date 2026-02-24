"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface HeroBannerProps {
    image: string;
}

export default function HeroBanner({ image }: HeroBannerProps) {
    const [loaded, setLoaded] = useState(false);

    return (
        <div className="w-full relative">
            <Link href="/products" className="block w-full">
                <div className="relative aspect-[16/6] md:aspect-[16/5] overflow-hidden bg-gray-100">

                    {/* Skeleton shimmer — always visible until image loads */}
                    <div
                        className={`absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse transition-opacity duration-500 ${loaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    />

                    {/* Real image — crossfades in once loaded */}
                    {image && (
                        <Image
                            src={image}
                            alt="Store Banner"
                            fill
                            className={`object-cover w-full h-full transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                            priority
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                            unoptimized
                            onLoad={() => setLoaded(true)}
                        />
                    )}
                </div>
            </Link>
        </div>
    );
}
