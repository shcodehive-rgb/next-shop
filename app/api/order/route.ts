import { NextResponse } from "next/server";
import { db } from "@/lib/firebase"; // تأكدي بلي مسار firebase صحيح
import { doc, getDoc } from "firebase/firestore";

// ✅ ديري هاد السطر فبلاصتو:
export const revalidate = 3600;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("📥 Received API Payload:", JSON.stringify(body, null, 2)); // DEBUG PAYLOAD

        const { orderDetails, message: customMessage } = body;

        let message = "";

        if (customMessage) {
            // Case A: Client sent a ready-to-send message (e.g. ProductModal)
            message = customMessage;
        } else if (orderDetails) {
            // Case B: Client sent details, we build the message (e.g. CheckoutModal)
            message = `📦 طلبية جديدة!\n\n👤 السمية: ${orderDetails.name}\n📱 التيليفون: ${orderDetails.phone}\n💰 المجموع: ${orderDetails.total} DH\n🏙️ المدينة: ${orderDetails.city}\n🏠 العنوان: ${orderDetails.client?.address || 'N/A'}`;
        } else {
            console.error("❌ Missing payload info");
            return NextResponse.json({ error: "Invalid Data" }, { status: 400 });
        }

        // 1️⃣ جيب الـ Chat ID من Firebase (ماشي من Vercel)
        // هنا كنقولو للسيستيم: سير لـ settings وجيب ليا الوثيقة general
        const settingsRef = doc(db, "settings", "general");
        const settingsSnap = await getDoc(settingsRef);

        if (!settingsSnap.exists()) {
            return NextResponse.json({ error: "إعدادات التيليغرام غير موجودة" }, { status: 500 });
        }

        const { telegramId, telegramBotToken } = settingsSnap.data();

        // DEBUG: See what is actually in the DB
        console.log("🔍 DB Settings Dump:", JSON.stringify(settingsSnap.data(), null, 2));

        // تأكد بلي الـ ID كاين
        // تأكد بلي الـ ID كاين
        if (!telegramId || !telegramBotToken) {
            console.warn("Notification Skipped: Store owner has not configured Telegram ID/Token");
            // Graceful exit: Return 200 so the client doesn't see a red error
            return NextResponse.json({ success: true, warning: "Store owner has not configured Telegram ID" });
        }

        // 2️⃣ صيفط الميساج لتيليغرام باستعمال المعلومات اللي جبنا
        // const message = ... (Already built above)

        // DEBUG: Log what we are using (Masked for safety)
        console.log(`🚀 Attempting to send to Telegram. ID: ${telegramId}, Token: ${telegramBotToken.substring(0, 10)}...`);

        const telegramUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;

        const telegramRes = await fetch(telegramUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: telegramId,
                text: message,
                parse_mode: "HTML",
            }),
        });

        if (!telegramRes.ok) {
            const telegramError = await telegramRes.json();
            console.error("❌ Telegram API Error:", telegramError);
            // Don't fail the order, just log the error
        } else {
            console.log("✅ Telegram Notification Sent Successfully!");
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error sending notification:", error);
        return NextResponse.json({ error: "فشل الإرسال" }, { status: 500 });
    }
}