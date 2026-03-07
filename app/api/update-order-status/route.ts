import { NextRequest, NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebase-admin";
// Use REST API to update RTDB — avoids needing databaseURL in Admin SDK config
// RTDB REST endpoint: https://<project>.firebaseio.com/orders/<store>/<id>.json

export async function PATCH(req: NextRequest) {
    try {
        const { orderId, status, storeName } = await req.json();

        if (!orderId || !status || !storeName) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const safeStoreName = storeName.replace(/[.#$\/\[\]]/g, "_");
        const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;

        if (!databaseURL) {
            return NextResponse.json({ error: "RTDB URL not configured" }, { status: 500 });
        }

        // Use RTDB REST API with a service account token via Admin SDK
        const { adminApp } = await import("@/lib/firebase-admin");
        const admin = (await import("firebase-admin")).default;
        const token = await admin.app(adminApp.name).options.credential?.getAccessToken();

        const rtdbRes = await fetch(
            `${databaseURL}/orders/${safeStoreName}/${orderId}/status.json?access_token=${token?.access_token}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(status),
            }
        );

        if (!rtdbRes.ok) {
            const body = await rtdbRes.text();
            console.error("RTDB REST error:", body);
            return NextResponse.json({ error: "RTDB update failed" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("update-order-status error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
