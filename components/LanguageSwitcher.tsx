"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Current locale detection - extract only language code (ar, fr, en)
    const pathLocale = pathname.split('/')[1] || 'ar';
    const currentLocale = pathLocale.split('-')[0]; // Extract 'ar' from 'ar-MA', 'en' from 'en-US', etc.

    const LANGUAGES = [
        { code: 'ar', label: 'العربية' },
        { code: 'fr', label: 'Français' },
        { code: 'en', label: 'English' }
    ];

    // Static label map to prevent concatenation bugs
    const LABEL_MAP: { [key: string]: string } = {
        'ar': 'AR',
        'fr': 'FR',
        'en': 'EN',
        'en-US': 'EN',
        'fr-FR': 'FR',
        'ar-MA': 'AR'
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLanguageChange = (newLocale: string) => {
        // Replace the locale in the path
        const pathSegments = pathname.split('/');
        pathSegments[1] = newLocale; // Replace 'ar', 'en', or 'fr'
        const newPath = pathSegments.join('/');
        router.push(newPath);
        setIsOpen(false);
    };

    const currentLang = LANGUAGES.find(l => l.code === currentLocale) || LANGUAGES[0];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 text-gray-700 hover:text-emerald-600 transition p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200"
                aria-label="Select Language"
            >
                <Globe className="w-4 h-4" />
                <span className="text-xs font-bold leading-none uppercase">{LABEL_MAP[currentLocale] || 'EN'}</span>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="py-1">
                        {LANGUAGES.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                dir="ltr"
                                className={`w-full px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors text-left
                                    ${currentLocale === lang.code ? 'bg-emerald-50 text-emerald-600 font-medium' : 'text-gray-700'}
                                `}
                            >
                                <span className={`${lang.code === 'ar' ? 'font-arabic' : ''}`}>{lang.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
