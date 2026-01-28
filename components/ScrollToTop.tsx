"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            // Show when scrolled down 300px
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    if (!isVisible) return null;

    return (
        <button
            onClick={scrollToTop}
            className="fixed bottom-6 left-6 z-50 p-3 rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 hover:scale-110 active:scale-95 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
            aria-label="Scroll to top"
        >
            <ArrowUp className="w-6 h-6" />
        </button>
    );
}
