import { NextResponse } from "next/server";


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
            message = `📦 طلبية جديدة!\n\n👤 السمية: ${orderDetails.name}\n📱 التيليفون: ${orderDetails.phone}\n🛍️ المنتجات: ${orderDetails.items || 'Unknown'}\n💰 المجموع: ${orderDetails.total} DH\n🏙️ المدينة: ${orderDetails.city}\n🏠 العنوان: ${orderDetails.client?.address || 'N/A'}`;
        } else {
            console.error("❌ Missing payload info");
            return NextResponse.json({ error: "Invalid Data" }, { status: 400 });
        }

        // 1️⃣ Get Credentials from Environment Variables
        const telegramId = process.env.TELEGRAM_CHAT_ID;
        const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;

        // DEBUG: Log what we are using (Masked for safety)
        console.log(`🚀 Attempting to send to Telegram. ID: ${telegramId}, Token: ${(telegramBotToken || "").substring(0, 10)}...`);

        if (!telegramId || !telegramBotToken) {
            console.error("❌ Telegram Configuration Missing in Environment Variables");
            return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
        }

        // 2️⃣ Send Message
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