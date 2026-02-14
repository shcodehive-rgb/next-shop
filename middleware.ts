import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

// 1. Initialize next-intl Middleware
const intlMiddleware = createMiddleware({
    // A list of all locales that are supported
    locales: ['ar', 'en', 'fr'],

    // Used when no locale matches
    defaultLocale: 'ar',

    // Always use prefix for consistency
    localePrefix: 'always'
});

// 2. Rate Limiting Logic (In-Memory Map)
const rateLimitMap = new Map();

function rateLimit(ip: string, limit: number, windowMs: number) {
    if (!rateLimitMap.has(ip)) {
        rateLimitMap.set(ip, { count: 0, lastReset: Date.now() });
    }

    const ipData = rateLimitMap.get(ip);
    const now = Date.now();

    if (now - ipData.lastReset > windowMs) {
        ipData.count = 0;
        ipData.lastReset = now;
    }

    if (ipData.count >= limit) {
        return false;
    }

    ipData.count += 1;
    return true;
}

// 3. Main Middleware Function
export default async function middleware(request: NextRequest) {
    const ip = request.ip || '127.0.0.1';
    const path = request.nextUrl.pathname;

    // --- RULE 1: Global Rate Limit (50 req / 10s) ---
    // Protects against massive flooding
    if (!rateLimit(ip, 50, 10 * 1000)) {
        return new NextResponse('Too Many Requests. Please wait a moment.', { status: 429 });
    }

    // --- RULE 2: Sensitive Routes (Checkout) (3 req / 60s) ---
    // Protects against spam orders - STRICT
    if (path.includes('/checkout') || path.includes('/api/order')) {
        if (!rateLimit(`${ip}:checkout`, 3, 60 * 1000)) {
            return new NextResponse('Too Many Checkout Attempts. Please wait.', { status: 429 });
        }
    }

    // --- RULE 3: Auth Routes (Admin) (5 req / 60s) ---
    // Protects against brute force

    // A) Detect localized admin paths (e.g. /en/admin) and Redirect to /admin
    if (path.match(/^\/(ar|en|fr)\/admin/)) {
        const url = request.nextUrl.clone();
        url.pathname = '/admin';
        return NextResponse.redirect(url);
    }

    // B) Standard Admin Path Protection
    if (path.startsWith('/admin')) {
        if (!rateLimit(`${ip}:auth`, 5, 60 * 1000)) {
            return new NextResponse('Too Many Login Attempts. Please wait.', { status: 429 });
        }
        // Bypass next-intl for admin (prevent 404s or unwanted redirects)
        return NextResponse.next();
    }

    // 4. Pass control to next-intl for localization
    return intlMiddleware(request);
}

// Match only internationalized pathnames
// Skip internal paths: (_next, api, images, etc)
// 🛑 Rule: Exclude root '/' so app/page.tsx can handle dynamic redirect
export const config = {
    matcher: ['/((?!api|_next|_vercel|.*\\..*|admin|/$).*)', '/admin/:path*', '/checkout/:path*']
};
