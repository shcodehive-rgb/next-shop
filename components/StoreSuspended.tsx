import Link from "next/link";
import { Lock, Phone } from "lucide-react";

export default function StoreSuspended() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center font-tajawal">

            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-gray-100 animate-in zoom-in-95 duration-300">
                <div className="mx-auto w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                    <Lock className="w-10 h-10" />
                </div>

                <h1 className="text-2xl font-black text-gray-900 mb-2">هذا المتجر متوقف مؤقتاً</h1>
                <p className="text-gray-500 mb-8 leading-relaxed">
                    عذراً، هذا المتجر غير متاح حالياً. المرجو التواصل مع الإدارة لتسوية الوضعية واستعادة الخدمة.
                    <br />
                    <span className="text-sm mt-2 block opacity-75">(Store Temporarily Suspended)</span>
                </p>

                <a
                    href="https://wa.me/212600000000?text=السلام عليكم، بخصوص توقف المتجر"
                    className="w-full bg-emerald-500 text-white py-4 rounded-xl font-bold hover:bg-emerald-600 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                >
                    <Phone className="w-5 h-5" />
                    <span>تواصل مع الدعم الفني</span>
                </a>

                <p className="text-[10px] text-gray-300 mt-6 font-mono">ID: STORE_SUSPEND_001</p>
            </div>
        </div>
    );
}
