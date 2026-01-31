"use client";
import React from 'react';
import { Category } from "@/context/ShopContext";
import Link from 'next/link';
import { ShopProvider } from "@/context/ShopContext";

interface CategoryRailProps {
    categories: Category[];
}

export default function CategoryRail({ categories }: CategoryRailProps) {
    return (
        <div className="py-4 bg-white">

            {/* Title Section */}
            <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-wide">
                    تسوق حسب الفئة
                </h2>
                <div className="w-16 h-1 bg-emerald-600 mx-auto mt-2 rounded-full"></div>
            </div>

            {/* GRID LAYOUT CONTAINER */}
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                    {categories.map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/collection/${cat.id}`}
                            className="flex flex-col items-center group w-full p-2"
                        >
                            {/* BIGGER CIRCLE CONTAINER - Responsive sizing */}
                            <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-56 lg:h-56 rounded-full overflow-hidden border-[3px] border-gray-100 transition-all duration-300 shadow-sm group-hover:border-emerald-500 group-hover:shadow-xl group-hover:scale-105">
                                <img
                                    src={cat.image}
                                    alt={cat.name}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                />
                            </div>

                            {/* TEXT CLOSER TO CIRCLE */}
                            <span className="mt-3 font-bold text-sm md:text-lg text-gray-800 group-hover:text-emerald-600 transition-colors uppercase tracking-wide text-center">
                                {cat.name}
                            </span>
                        </Link>
                    ))}

                    {/* Empty State */}
                    {categories.length === 0 && (
                        <div className="col-span-full text-center text-gray-400 py-10">
                            لا توجد تصنيفات حالياً
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
