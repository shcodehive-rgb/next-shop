"use client";
import React from 'react';
import { Truck, ShieldCheck, Wallet } from 'lucide-react';

export default function FeaturesBar() {
    const features = [
        {
            icon: <Truck className="w-10 h-10 text-emerald-600" />,
            title: "توصيل سريع",
            desc: "توصيل لجميع المدن المغربية في وقت قياسي"
        },
        {
            icon: <Wallet className="w-10 h-10 text-emerald-600" />,
            title: "دفع عند الاستلام",
            desc: "لا تؤدي الثمن حتى تتوصل بطلبيتك وتقلبها"
        },
        {
            icon: <ShieldCheck className="w-10 h-10 text-emerald-600" />,
            title: "ضمان الجودة",
            desc: "منتجات مختارة بعناية وتطابق الصور 100%"
        }
    ];

    return (
        <div className="bg-white/50 backdrop-blur-sm py-8 mt-8 border-t border-gray-100">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    {features.map((item, index) => (
                        <div key={index} className="flex flex-col items-center group cursor-default">
                            {/* Icon */}
                            <div className="p-4 bg-emerald-50 rounded-full mb-4 transform group-hover:scale-110 transition duration-300">
                                {item.icon}
                            </div>
                            {/* Title */}
                            <h3 className="font-bold text-lg text-gray-900 mb-2">
                                {item.title}
                            </h3>
                            {/* Description */}
                            <p className="text-sm text-gray-500 max-w-xs leading-relaxed font-medium">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
