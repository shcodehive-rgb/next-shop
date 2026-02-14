"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useShop } from "@/context/ShopContext";

export default function FacebookPixel() {
    const { settings } = useShop();
    const pathname = usePathname();

    // Don't render on admin routes
    if (pathname?.startsWith("/admin")) return null;

    const pixelId = settings?.facebookPixelId;

    useEffect(() => {
        // Manually track page view on route change if pixel is initialized
        if (pixelId) {
            // @ts-ignore
            if (typeof window.fbq !== 'undefined') {
                // @ts-ignore
                window.fbq('track', 'PageView');
            }
        }
    }, [pathname, pixelId]);

    if (!pixelId) return null;

    return (
        <>
            <Script
                id="fb-pixel"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `,
                }}
            />
        </>
    );
}
