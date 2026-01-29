import Link from 'next/link';

interface HeroBannerProps {
    image: string;
}

export default function HeroBanner({ image }: HeroBannerProps) {
    if (!image) return null;

    return (
        <div className="w-full relative">
            <Link href="/products" className="block w-full">
                <div className="relative aspect-[16/6] md:aspect-[16/5] overflow-hidden">
                    <img
                        src={image}
                        alt="Store Banner"
                        className="object-cover w-full h-full animate-in fade-in duration-700"
                    />
                </div>
            </Link>
        </div>
    );
}
