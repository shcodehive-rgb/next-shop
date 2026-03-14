"use client";

import { useTranslations } from "next-intl";
import { Phone, MessageCircle, Clock } from "lucide-react";

export default function ContactPage() {
    // Hardcoded content as per user request, but structure ready for i18n if needed later.
    // User requested EXACT content, so we use that.

    const phoneNumber = "+212 688-771251";
    const cleanPhone = "212688771251";
    const whatsappLink = `https://wa.me/${cleanPhone}`;

    return (
        <div className="min-h-[70vh] bg-gray-50 flex flex-col items-center py-12 px-4" dir="rtl">

            {/* Header Section */}
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-4">
                <h1 className="text-4xl font-black text-gray-900">
                    تواصل معنا
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                    نحن هنا لمساعدتك! إذا كان لديك أي استفسار حول طلبك أو منتجاتنا، فلا تتردد في التواصل معنا.
                </p>
            </div>

            {/* Contact Card */}
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100">

                {/* Phone / WhatsApp Section */}
                <div className="p-8 border-b border-gray-100 hover:bg-emerald-50/50 transition duration-300">
                    <div className="flex items-start gap-4">
                        <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600 shrink-0">
                            <Phone className="w-6 h-6" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-bold text-gray-900 text-lg">الهاتف / واتساب</h3>
                            <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-2xl font-black text-emerald-600 hover:text-emerald-700 transition"
                                dir="ltr"
                            >
                                {phoneNumber}
                            </a>
                        </div>
                    </div>
                </div>

                {/* Working Hours Section */}
                <div className="p-8 hover:bg-blue-50/50 transition duration-300">
                    <div className="flex items-start gap-4">
                        <div className="bg-blue-100 p-3 rounded-2xl text-blue-600 shrink-0">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-bold text-gray-900 text-lg">أوقات العمل</h3>
                            <p className="text-gray-600 font-medium">
                                طيلة أيام الأسبوع
                            </p>
                            <p className="text-gray-500 text-sm">
                                (من 9:00 صباحاً إلى 12:00 ليلاً)
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Footer Note */}
            <div className="mt-8 text-center">
                <a
                    href={whatsappLink}
                    className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:underline"
                >
                    <MessageCircle className="w-5 h-5" />
                    <span>تحدث معنا مباشرة عبر الواتساب</span>
                </a>
            </div>

        </div>
    );
}
