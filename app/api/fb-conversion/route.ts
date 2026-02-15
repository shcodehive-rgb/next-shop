import { NextRequest, NextResponse } from "next/server";
import { sendMetaCAPIEvent } from "@/lib/meta-capi";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        // Body should contain: { event_name, event_id, user_data, custom_data }

        const result = await sendMetaCAPIEvent(body.event_name || 'Purchase', body);

        if (result?.error) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error("Server Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
