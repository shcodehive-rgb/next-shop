"use client";

import { Users, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface ProductFOMOProps {
    stock?: number;
}

export default function ProductFOMO({ stock }: ProductFOMOProps) {
    const t = useTranslations('Product');
    const [viewers, setViewers] = useState(5);
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        // Random viewers between 5 and 15
        setViewers(Math.floor(Math.random() * 10) + 5);

        // Random update every 5-10 seconds
        const interval = setInterval(() => {
            setViewers(prev => {
                const change = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
                return Math.max(3, prev + change);
            });
        }, 7000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Calculate time left until midnight or next shipping cutoff
        const now = new Date();
        const cutoff = new Date();
        cutoff.setHours(24, 0, 0, 0); // Midnight

        const updateTimer = () => {
            const now = new Date();
            const diff = cutoff.getTime() - now.getTime();
            if (diff > 0) {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                setTimeLeft(`${hours}h ${minutes}m`);
            }
        };

        updateTimer();
        const timer = setInterval(updateTimer, 60000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="space-y-3 mb-4">
            {/* Live Viewers */}
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-amber-50 p-2 rounded-lg border border-amber-100 animate-pulse">
                <Users className="w-4 h-4 text-amber-600" />
                <span>
                    <strong className="text-amber-700">{viewers}</strong> people are viewing this right now
                </span>
            </div>

            {/* Low Stock Warning */}
            {stock !== undefined && stock > 0 && stock < 10 && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    <span>
                        Only <strong>{stock}</strong> items left in stock!
                    </span>
                </div>
            )}

            {/* Order Deadline */}
            <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>
                    Order within <strong>{timeLeft}</strong> for fast shipping!
                </span>
            </div>
        </div>
    );
}
