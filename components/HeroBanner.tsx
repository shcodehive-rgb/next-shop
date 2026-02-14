import Link from 'next/link';
import Image from 'next/image';

interface HeroBannerProps {
    image: string;
}

export default function HeroBanner({ image }: HeroBannerProps) {
    if (!image) return null;

    return (
        <div className="w-full relative">
            <Link href="/products" className="block w-full">
                <div className="relative aspect-[16/6] md:aspect-[16/5] overflow-hidden">
                    <Image
                        src={image}
                        alt="Store Banner"
                        fill
                        className="object-cover w-full h-full animate-in fade-in duration-700"
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                        unoptimized // Safe for external URLs without next.config setup
                    />
                </div>
            </Link>
        </div>
    );
}
