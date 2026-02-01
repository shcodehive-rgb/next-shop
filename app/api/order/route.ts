import { NextResponse } from "next/server";
import { db } from "@/lib/firebase"; // تأكدي بلي مسار firebase صحيح
import { doc, getDoc } from "firebase/firestore";

// ✅ ديري هاد السطر فبلاصتو:
export const revalidate = 3600;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { orderDetails } = body; // المعلومات ديال الطلبية

        // 1️⃣ جيب الـ Chat ID من Firebase (ماشي من Vercel)
        // هنا كنقولو للسيستيم: سير لـ settings وجيب ليا الوثيقة general
        const settingsRef = doc(db, "settings", "general");
        const settingsSnap = await getDoc(settingsRef);

        if (!settingsSnap.exists()) {
            return NextResponse.json({ error: "إعدادات التيليغرام غير موجودة" }, { status: 500 });
        }

        const { telegramId, telegramBotToken } = settingsSnap.data();

        // تأكد بلي الـ ID كاين
        if (!telegramId || !telegramBotToken) {
            console.error("Missing Credentials:", { telegramId, telegramBotToken: telegramBotToken ? "HIDDEN" : "MISSING" });
            return NextResponse.json({ error: "معلومات التيليغرام ناقصة (Telegram ID or Token)" }, { status: 400 });
        }

        // 2️⃣ صيفط الميساج لتيليغرام باستعمال المعلومات اللي جبنا
        const message = `📦 طلبية جديدة!\n\n👤 السمية: ${orderDetails.name}\n📱 التيليفون: ${orderDetails.phone}\n💰 المجموع: ${orderDetails.total} DH`;

        const telegramUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;

        await fetch(telegramUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: telegramId, // ✅ هاهو الـ ID الديناميكي
                text: message,
            }),
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error sending notification:", error);
        return NextResponse.json({ error: "فشل الإرسال" }, { status: 500 });
    }
}