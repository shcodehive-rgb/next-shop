import { NextRequest, NextResponse } from "next/server";
import { sendMetaCAPIEvent, sendPageViewEvent } from "@/lib/meta-capi";

/**
 * POST /api/meta-events
 *
 * Generic endpoint — send any Meta CAPI event from the client.
 *
 * Body (JSON):
 * {
 *   event_name:      string;           // e.g. "PageView", "Purchase"
 *   event_id?:       string;           // deduplication ID matching browser pixel
 *   event_source_url?: string;
 *   email?:          string;           // raw — hashed server-side
 *   phone?:          string;           // raw — hashed server-side
 *   custom_data?:    object;           // e.g. { value, currency }
 * }
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Forward real client IP & user-agent for better event matching
        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
            req.headers.get("x-real-ip") ||
            undefined;
        const userAgent = req.headers.get("user-agent") || undefined;

        const result = await sendMetaCAPIEvent({
            eventName: body.event_name || "PageView",
            eventId: body.event_id,
            eventSourceUrl: body.event_source_url,
            clientIpAddress: ip,
            clientUserAgent: userAgent,
            email: body.email,
            phone: body.phone,
            customData: body.custom_data,
        });

        if (result?.error) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json({ success: true, result });
    } catch (err) {
        console.error("[/api/meta-events] Internal error:", err);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}

/**
 * GET /api/meta-events?url=<page_url>
 *
 * Lightweight PageView endpoint — called from the homepage server component
 * or via a simple fetch() from the client.
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const pageUrl = searchParams.get("url") || req.headers.get("referer") || "";

        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
            req.headers.get("x-real-ip") ||
            undefined;
        const userAgent = req.headers.get("user-agent") || undefined;

        const result = await sendPageViewEvent({ url: pageUrl, ip, userAgent });

        if (result?.error) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json({ success: true, result });
    } catch (err) {
        console.error("[/api/meta-events] GET error:", err);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
