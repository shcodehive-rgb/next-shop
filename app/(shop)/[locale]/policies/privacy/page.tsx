import { Lock } from "lucide-react";

export default function PrivacyPolicy() {
    return (
        <div className="min-h-[60vh] bg-white text-gray-800" dir="rtl">
            <div className="container mx-auto px-4 py-12 max-w-3xl">

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2 font-tajawal">
                        سياسة الخصوصية
                    </h1>
                    <div className="w-20 h-1.5 bg-blue-500 rounded-full mx-auto mt-4"></div>
                </div>

                {/* Content */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 md:p-10 leading-loose text-lg font-medium text-gray-600 space-y-6">
                    <p className="flex items-start gap-3">
                        <span className="text-blue-500 font-bold text-xl mt-1">•</span>
                        <span>
                            نحن نحترم خصوصية زبنائنا بشكل كامل. المعلومات التي نجمعها في صفحة الشراء (الاسم، رقم الهاتف، العنوان) تُستخدم <strong className="text-gray-900">حصرياً</strong> لمعالجة طلبك وإيصاله إليك في أسرع وقت.
                        </span>
                    </p>
                    <p className="flex items-start gap-3">
                        <span className="text-blue-500 font-bold text-xl mt-1">•</span>
                        <span>
                            نضمن لك <strong className="text-gray-900">عدم مشاركة أو بيع</strong> معلوماتك الشخصية لأي طرف ثالث تحت أي ظرف من الظروف.
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}
