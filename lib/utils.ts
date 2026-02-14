// Simple utility for class names (no external dependencies)
export function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}

// Safely get string from a potential localized object
export function getLocalized(value: any, locale: string = 'ar'): string {
    if (!value) return "";
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
        const val = value[locale] || value['ar'] || value['en'] || value['fr'] || "";
        return String(val);
    }
    return String(value);
}

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

// Specialized helper for Product Titles (Prefers FR > AR > EN)
export function getProductTitle(title: any): string {
    if (!title) return "Untitled";
    if (typeof title === 'string') return title;
    if (typeof title === 'object') {
        return title['fr'] || title['ar'] || title['en'] || "Untitled";
    }
    return String(title);
}
