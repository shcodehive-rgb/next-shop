import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface PromoBannerProps {
    image: string;
    link: string;
}

export default function PromoBanner({ image, link }: PromoBannerProps) {
    if (!image) return null;

    return (
        <div className="container mx-auto px-4 my-8">
            <Link href={link} className="block relative w-full aspect-[16/7] md:aspect-[16/4] rounded-2xl overflow-hidden group shadow-md hover:shadow-xl transition-all duration-300">
                <img
                    src={image}
                    alt="Promo"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition" />

                {/* Call to Action Overlay (Optional) */}
                <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 bg-white/90 backdrop-blur-sm px-6 py-2 rounded-full flex items-center gap-2 text-gray-900 font-bold shadow-lg transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition duration-300">
                    تسوق الآن <ArrowRight className="w-4 h-4" />
                </div>
            </Link>
        </div>
    );
}
