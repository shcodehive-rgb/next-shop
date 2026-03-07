"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Fire a server-side Meta CAPI PageView event whenever the page URL changes.
 * Drop this hook into any layout or page component.
 *
 * Usage:
 *   import { useMetaPageView } from "@/hooks/useMetaPageView";
 *   export default function Layout() {
 *     useMetaPageView();
 *     return <>{children}</>;
 *   }
 */
export function useMetaPageView() {
    const pathname = usePathname();

    useEffect(() => {
        const url = window.location.href;

        fetch(`/api/meta-events?url=${encodeURIComponent(url)}`, {
            method: "GET",
            // fire-and-forget — we don't block rendering on this
        }).catch(() => {
            // Silently swallow network errors — CAPI is non-critical
        });
    }, [pathname]);
}
