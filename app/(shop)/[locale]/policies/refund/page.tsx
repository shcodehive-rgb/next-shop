import { ShieldCheck } from "lucide-react";

export default function RefundPolicy() {
    return (
        <div className="min-h-[60vh] bg-white text-gray-800" dir="rtl">
            <div className="container mx-auto px-4 py-12 max-w-3xl">

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2 font-tajawal">
                        سياسة الإرجاع والاستبدال
                    </h1>
                    <div className="w-20 h-1.5 bg-red-500 rounded-full mx-auto mt-4"></div>
                </div>

                {/* Content */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 md:p-10 leading-loose text-lg font-medium text-gray-600 space-y-6">
                    <p className="flex items-start gap-3">
                        <span className="text-red-500 font-bold text-xl mt-1">•</span>
                        <span>
                            يحق للزبون إرجاع أو استبدال المنتج خلال <strong className="text-gray-900">7 أيام</strong> من تاريخ الاستلام في حالة وجود عيب مصنعي أو تلف.
                        </span>
                    </p>
                    <p className="flex items-start gap-3">
                        <span className="text-red-500 font-bold text-xl mt-1">•</span>
                        <span>
                            يشترط أن يكون المنتج في حالته الأصلية وبغلافه الأصلي ولم يتم استخدامه.
                        </span>
                    </p>
                    <p className="flex items-start gap-3">
                        <span className="text-red-500 font-bold text-xl mt-1">•</span>
                        <span>
                            يتحمل المتجر مصاريف الشحن بالكامل في حالة وصول منتج خاطئ أو تالف للزبون.
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}
