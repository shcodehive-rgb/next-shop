import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// SHA-256 Hashing helper
const hashData = (data: string) => {
    if (!data) return null;
    return crypto.createHash("sha256").update(data.trim().toLowerCase()).digest("hex");
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { event_name, event_time, user_data, custom_data, event_id, pixel_id, access_token } = body;

        if (!pixel_id || !access_token) {
            return NextResponse.json({ error: "Missing Pixel ID or Access Token" }, { status: 400 });
        }

        // 1. Hash User Data (Required by FB)
        const hashedUserData = {
            em: hashData(user_data.email),
            ph: hashData(user_data.phone),
            client_ip_address: user_data.client_ip_address,
            client_user_agent: user_data.client_user_agent,
            ct: hashData(user_data.city),
            st: hashData(user_data.state),
            country: hashData(user_data.country || 'ma'), // Default to Morocco
        };

        // Remove nulls
        Object.keys(hashedUserData).forEach(key => {
            // @ts-ignore
            if (!hashedUserData[key]) delete hashedUserData[key];
        });

        // 2. Construct Payload
        const payload = {
            data: [
                {
                    event_name: event_name,
                    event_time: event_time,
                    action_source: "website",
                    event_id: event_id,
                    user_data: hashedUserData,
                    custom_data: custom_data,
                },
            ],
            // test_event_code: "TEST12345" // Uncomment for Testing in Events Manager
        };

        // 3. Send to Facebook Graph API
        const fbUrl = `https://graph.facebook.com/v19.0/${pixel_id}/events?access_token=${access_token}`;

        const response = await fetch(fbUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (data.error) {
            console.error("🔥 CAPI Error:", data.error);
            return NextResponse.json({ error: data.error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, fb_trace_id: data.fbtrace_id });

    } catch (error) {
        console.error("Server Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
