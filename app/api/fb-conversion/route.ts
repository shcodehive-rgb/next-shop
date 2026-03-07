import { NextRequest, NextResponse } from "next/server";
import { sendMetaCAPIEvent } from "@/lib/meta-capi";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        // Body may contain: { event_name, event_id, event_source_url, email, phone, custom_data }

        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
            req.headers.get("x-real-ip") ||
            undefined;
        const userAgent = req.headers.get("user-agent") || undefined;

        const result = await sendMetaCAPIEvent({
            eventName: body.event_name || "Purchase",
            eventId: body.event_id,
            eventSourceUrl: body.event_source_url,
            clientIpAddress: ip,
            clientUserAgent: userAgent,
            email: body.email,
            phone: body.phone,
            customData: body.custom_data,
        });

        if (result?.error) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error("Server Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
