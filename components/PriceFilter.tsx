"use client";

import { useState } from 'react';
import { useShop } from '@/context/ShopContext';
import { useTranslations, useLocale } from 'next-intl';
import { Filter, X } from 'lucide-react';

export default function PriceFilter() {
    const { priceFilter, setPriceFilter } = useShop();
    const locale = useLocale();
    const t = useTranslations('PriceFilter');

    const [localMin, setLocalMin] = useState(priceFilter.min.toString());
    const [localMax, setLocalMax] = useState(priceFilter.max.toString());

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setLocalMin(value);
        const numValue = parseInt(value) || 0;
        setPriceFilter(prev => ({ ...prev, min: numValue }));
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setLocalMax(value);
        const numValue = parseInt(value) || 1000;
        setPriceFilter(prev => ({ ...prev, max: numValue }));
    };

    const clearFilter = () => {
        setLocalMin('0');
        setLocalMax('1000');
        setPriceFilter({ min: 0, max: 1000 });
    };

    const hasActiveFilter = priceFilter.min > 0 || priceFilter.max < 1000;

    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-emerald-600" />
                    {locale === 'ar' ? 'فلترة الأسعار' : 'Price Filter'}
                </h3>
                {hasActiveFilter && (
                    <button
                        onClick={clearFilter}
                        className="text-sm text-red-600 hover:text-red-700 transition font-medium"
                    >
                        {locale === 'ar' ? 'مسح الفلتر' : 'Clear Filter'}
                    </button>
                )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {locale === 'ar' ? 'أدنى سعر' : 'Minimum Price'}
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            {locale === 'ar' ? 'د.م' : 'DH'}
                        </span>
                        <input
                            type="number"
                            value={localMin}
                            onChange={handleMinChange}
                            placeholder="0"
                            className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            min="0"
                            max="1000"
                        />
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {locale === 'ar' ? 'أقصى سعر' : 'Maximum Price'}
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            {locale === 'ar' ? 'د.م' : 'DH'}
                        </span>
                        <input
                            type="number"
                            value={localMax}
                            onChange={handleMaxChange}
                            placeholder="1000"
                            className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            min="0"
                            max="1000"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
