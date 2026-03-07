import { NextResponse } from "next/server";

export const revalidate = 3600;

/** Always returns the Arabic title from a product title object, or the raw string */
function getArabicTitle(title: any): string {
    if (!title) return "منتج";
    if (typeof title === "string") return title;
    return title["ar"] || title["en"] || title["fr"] || "منتج";
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { orderDetails } = body;

        if (!orderDetails) {
            console.error("❌ Missing orderDetails payload");
            return NextResponse.json({ error: "Invalid Data" }, { status: 400 });
        }

        // Resolve item titles to Arabic (items can be a pre-built string or an array)
        let itemsText = "غير محدد";
        if (Array.isArray(orderDetails.items)) {
            itemsText = orderDetails.items
                .map((i: any) => `${getArabicTitle(i.title)} (x${i.qty || 1})`)
                .join("، ");
        } else if (typeof orderDetails.items === "string") {
            itemsText = orderDetails.items; // already formatted by caller
        }

        // ── Always Arabic message template ──────────────────────────────────
        const message = [
            `📦 <b>طلبية جديدة!</b>`,
            ``,
            `👤 <b>الاسم:</b> ${orderDetails.name || "—"}`,
            `📱 <b>الهاتف:</b> ${orderDetails.phone || "—"}`,
            `🏙️ <b>المدينة:</b> ${orderDetails.city || "—"}`,
            `🏠 <b>العنوان:</b> ${orderDetails.address || orderDetails.client?.address || "—"}`,
            ``,
            `🛍️ <b>المنتجات:</b>`,
            `${itemsText}`,
            ``,
            `💰 <b>المجموع:</b> ${orderDetails.total} درهم`,
            orderDetails.shippingCost > 0
                ? `🚚 <b>الشحن:</b> ${orderDetails.shippingCost} درهم`
                : `🚚 <b>الشحن:</b> مجاني`,
        ].join("\n");

        // ── Send to Telegram ────────────────────────────────────────────────
        const telegramId = process.env.TELEGRAM_CHAT_ID;
        const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;

        if (!telegramId || !telegramBotToken) {
            console.error("❌ Telegram Configuration Missing");
            return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
        }

        const telegramRes = await fetch(
            `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: telegramId, text: message, parse_mode: "HTML" }),
            }
        );

        if (!telegramRes.ok) {
            const err = await telegramRes.json();
            console.error("❌ Telegram API Error:", err);
        } else {
            console.log("✅ Telegram Notification Sent (Arabic)");
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error sending notification:", error);
        return NextResponse.json({ error: "فشل الإرسال" }, { status: 500 });
    }
}
