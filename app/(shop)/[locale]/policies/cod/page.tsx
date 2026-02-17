import { WalletCards } from "lucide-react";

export default function CODPolicy() {
    return (
        <div className="min-h-[60vh] bg-white text-gray-800" dir="rtl">
            <div className="container mx-auto px-4 py-12 max-w-3xl">

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <WalletCards className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2 font-tajawal">
                        سياسة الدفع عند الاستلام
                    </h1>
                    <div className="w-20 h-1.5 bg-emerald-500 rounded-full mx-auto mt-4"></div>
                </div>

                {/* Content */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 md:p-10 leading-loose text-lg font-medium text-gray-600 space-y-6">
                    <p className="flex items-start gap-3">
                        <span className="text-emerald-500 font-bold text-xl mt-1">•</span>
                        <span>
                            الدفع عند الاستلام هو خيار الدفع الأساسي لدينا لضمان راحتكم وثقتكم.
                        </span>
                    </p>
                    <p className="flex items-start gap-3">
                        <span className="text-emerald-500 font-bold text-xl mt-1">•</span>
                        <span>
                            <strong className="text-gray-900">لن نطلب منك الدفع مسبقاً عبر الإنترنت.</strong> لن تدفع أي مبلغ حتى يصلك المنتج إلى باب منزلك، وتفحصه وتتأكد منه بنفسك.
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}
