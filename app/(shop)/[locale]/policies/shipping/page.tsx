import { Truck } from "lucide-react";

export default function ShippingPolicy() {
    return (
        <div className="min-h-[60vh] bg-white text-gray-800" dir="rtl">
            <div className="container mx-auto px-4 py-12 max-w-3xl">

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Truck className="w-8 h-8 text-purple-600" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2 font-tajawal">
                        سياسة الشحن والتوصيل
                    </h1>
                    <div className="w-20 h-1.5 bg-purple-500 rounded-full mx-auto mt-4"></div>
                </div>

                {/* Content */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 md:p-10 leading-loose text-lg font-medium text-gray-600 space-y-6">
                    <p className="flex items-start gap-3">
                        <span className="text-purple-500 font-bold text-xl mt-1">•</span>
                        <span>
                            بعد إتمام طلبك، سيقوم فريق الدعم بالاتصال بك هاتفياً لتأكيد الطلب والعنوان.
                        </span>
                    </p>
                    <p className="flex items-start gap-3">
                        <span className="text-purple-500 font-bold text-xl mt-1">•</span>
                        <span>
                            يستغرق التوصيل عادة بين <strong className="text-gray-900">24 إلى 48 ساعة</strong> لكافة المدن المغربية.
                        </span>
                    </p>
                    <p className="flex items-start gap-3">
                        <span className="text-purple-500 font-bold text-xl mt-1">•</span>
                        <span>
                            سيتواصل معكم مندوب شركة التوصيل هاتفياً لتحديد الوقت المناسب لتسليمكم الطلب بكل راحة.
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}
