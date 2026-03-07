"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

const PIXEL_ID = "2057590258139446";

export default function FacebookPixel() {
    const pathname = usePathname();

    // Don't render on admin routes
    if (pathname?.startsWith("/admin")) return null;

    useEffect(() => {
        // Track page view on every client-side route change
        if (typeof window !== "undefined" && typeof (window as any).fbq !== "undefined") {
            (window as any).fbq("track", "PageView");
        }
    }, [pathname]);

    return (
        <>
            {/* Meta Pixel base code */}
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
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');
                    `,
                }}
            />

            {/* NoScript fallback */}
            <noscript>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    height="1"
                    width="1"
                    style={{ display: "none" }}
                    src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
                    alt=""
                />
            </noscript>
        </>
    );
}
