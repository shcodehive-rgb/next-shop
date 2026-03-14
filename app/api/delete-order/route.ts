import { NextRequest, NextResponse } from "next/server";
import { adminApp } from "@/lib/firebase-admin";

export async function DELETE(req: NextRequest) {
    try {
        const { orderId, storeName } = await req.json();

        if (!orderId || !storeName) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const safeStoreName = storeName.replace(/[.#$\/\[\]]/g, "_");
        const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;

        if (!databaseURL) {
            return NextResponse.json({ error: "RTDB URL not configured" }, { status: 500 });
        }

        // Use RTDB REST API with a service account token via Admin SDK
        const admin = (await import("firebase-admin")).default;
        const token = await admin.app(adminApp.name).options.credential?.getAccessToken();

        const rtdbRes = await fetch(
            `${databaseURL}/orders/${safeStoreName}/${orderId}.json?access_token=${token?.access_token}`,
            {
                method: "DELETE",
            }
        );

        if (!rtdbRes.ok) {
            const body = await rtdbRes.text();
            console.error("RTDB REST error (DELETE):", body);
            return NextResponse.json({ error: "RTDB deletion failed" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("delete-order error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
