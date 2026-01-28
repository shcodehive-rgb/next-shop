"use client";
import { useShop } from "@/context/ShopContext";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function Analytics() {
    const { settings } = useShop();
    const pathname = usePathname();

    // 1. Facebook Pixel Injection
    useEffect(() => {
        if (settings.facebookPixelId) {
            console.log("🟢 Facebook Pixel Initialized:", settings.facebookPixelId);
            // @ts-ignore
            !function (f, b, e, v, n, t, s) {
                if (f.fbq) return; n = f.fbq = function () {
                    n.callMethod ?
                        n.callMethod.apply(n, arguments) : n.queue.push(arguments)
                };
                if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
                n.queue = []; t = b.createElement(e); t.async = !0;
                t.src = v; s = b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t, s)
            }(window as any, document, 'script',
                'https://connect.facebook.net/en_US/fbevents.js');

            // @ts-ignore
            window.fbq('init', settings.facebookPixelId);
            // @ts-ignore
            window.fbq('track', 'PageView');
        }
    }, [settings.facebookPixelId, pathname]);

    // 2. TikTok Pixel Injection
    useEffect(() => {
        if (settings.tiktokPixelId) {
            console.log("🎵 TikTok Pixel Initialized:", settings.tiktokPixelId);
            // @ts-ignore
            !function (w, d, t) {
                w.TiktokAnalyticsObject = t; var ttq = w[t] = w[t] || []; ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"], ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))) } }; for (var i = 0; i < ttq.methods.length; i++)ttq.setAndDefer(ttq, ttq.methods[i]); ttq.instance = function (t) { for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++)ttq.setAndDefer(e, ttq.methods[n]); return e }, ttq.load = function (e, n) { var i = "https://analytics.tiktok.com/i18n/pixel/events.js"; ttq._i = ttq._i || {}, ttq._i[e] = [], ttq._i[e]._u = i, ttq._t = ttq._t || {}, ttq._t[e] = +new Date, ttq._o = ttq._o || {}, ttq._o[e] = n || {}; var o = document.createElement("script"); o.type = "text/javascript", o.async = !0, o.src = i + "?sdkid=" + e + "&lib=" + t; var a = document.getElementsByTagName("script")[0]; a.parentNode.insertBefore(o, a) };

                // @ts-ignore
                ttq.load(settings.tiktokPixelId);
                // @ts-ignore
                ttq.page();
            }(window, document, 'ttq');
        }
    }, [settings.tiktokPixelId, pathname]);

    return null; // This component renders nothing visible
}
