import { NextResponse } from 'next/server';

// ✅👇 هذا هو السطر السحري اللي ناقصك (باش السيت يولي طيارة)
export const dynamic = 'force-dynamic';

// Helper: Format for WhatsApp
const formatForWhatsApp = (phone: string) => {
    let clean = phone.replace(/\D/g, '');
    if (clean.startsWith('0')) clean = '212' + clean.substring(1);
    return clean;
};

export async function POST(req: Request) {
    try {
        const body = await req.json();
        // هنا كنتسناو الـ ID يجينا من الـ Frontend (Checkout Page)
        const { orderData, merchantTelegramId } = body;

        const token = process.env.TELEGRAM_BOT_TOKEN;
        const shopName = process.env.NEXT_PUBLIC_SHOP_NAME || 'Unknown Shop';
        const adminId = process.env.SUPER_ADMIN_CHAT_ID;

        if (!token) throw new Error('TELEGRAM_BOT_TOKEN is missing');

        // 1. Prepare Message Data
        const waPhone = formatForWhatsApp(orderData.customerPhone);
        const total = orderData.total;
        const itemsList = orderData.items.map((i: any) => `${i.title || i.name} (x${i.qty})`).join(', ');

        const messageToMerchant = `
📦 <b>طلب جديد! (New Order)</b>
➖➖➖➖➖➖➖➖
👤 <b>الزبون:</b> ${orderData.customerName}
📱 <b>الهاتف:</b> ${orderData.customerPhone}
🏠 <b>المدينة:</b> ${orderData.customerCity}
➖➖➖➖➖➖➖➖
🛒 <b>المنتج:</b> ${itemsList}
💰 <b>المجموع:</b> ${total} DH
➖➖➖➖➖➖➖➖
`;

        // 2. Send to Merchant (Using the ID coming from Settings)
        if (merchantTelegramId) {
            await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: merchantTelegramId,
                    text: messageToMerchant,
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [[
                            { text: "💬 WhatsApp", url: `https://wa.me/${waPhone}?text=السلام عليكم` },
                            { text: "📞 اتصال", url: `tel:${orderData.customerPhone}` }
                        ]]
                    }
                })
            });
        } else {
            // هاد الميساج باش نعرفو واش الـ Frontend صيفط ID ولا لا
            console.log("⚠️ No Merchant ID provided from Checkout Page");
        }

        // 3. Send Copy to SUPER ADMIN (Amina)
        if (adminId && adminId !== merchantTelegramId) {
            const adminMsg = `
🚨 <b>مراقبة المبيعات (Sales Tracker)</b>
🏪 <b>المتجر:</b> ${shopName}
💰 <b>القيمة:</b> ${total} DH
🛒 <b>السلعة:</b> ${itemsList}
`;
            await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: adminId,
                    text: adminMsg,
                    parse_mode: 'HTML'
                })
            });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}