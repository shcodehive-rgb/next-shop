/**
 * Auto-Translation Utility
 * Uses MyMemory Translation API (free, no API key required)
 * Translates text to AR, EN, FR
 */

interface TranslatedText {
    ar: string;
    en: string;
    fr: string;
}

const MYMEMORY_API = "https://api.mymemory.translated.net/get";

/**
 * Detect language of input text (simple heuristic)
 */
function detectLanguage(text: string): 'ar' | 'en' | 'fr' {
    // Arabic detection (Unicode range)
    if (/[\u0600-\u06FF]/.test(text)) return 'ar';

    // French detection (common French words/characters)
    const frenchWords = /\b(le|la|les|un|une|des|et|de|du|pour|avec|dans|sur|est|sont|être|avoir)\b/i;
    const frenchChars = /[àâäéèêëïîôùûüÿæœç]/i;
    if (frenchWords.test(text) || frenchChars.test(text)) return 'fr';

    // Default to English
    return 'en';
}

/**
 * Translate text using MyMemory API
 */
async function translateToLanguage(text: string, sourceLang: string, targetLang: string): Promise<string> {
    try {
        const url = `${MYMEMORY_API}?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.responseStatus === 200 && data.responseData?.translatedText) {
            return data.responseData.translatedText;
        }

        // Fallback: return original text if translation fails
        return text;
    } catch (error) {
        console.error(`Translation error (${sourceLang} -> ${targetLang}):`, error);
        return text;
    }
}

/**
 * Main translation function
 * Takes a single text input and returns translations for all three languages
 */
export async function translateText(text: string): Promise<TranslatedText> {
    if (!text || text.trim() === '') {
        return { ar: '', en: '', fr: '' };
    }

    // Detect source language
    const sourceLang = detectLanguage(text);

    // Initialize result with source text
    const result: TranslatedText = {
        ar: sourceLang === 'ar' ? text : '',
        en: sourceLang === 'en' ? text : '',
        fr: sourceLang === 'fr' ? text : '',
    };

    // Translate to other languages
    const targetLangs = ['ar', 'en', 'fr'].filter(lang => lang !== sourceLang);

    try {
        const translations = await Promise.all(
            targetLangs.map(targetLang => translateToLanguage(text, sourceLang, targetLang))
        );

        // Assign translations
        targetLangs.forEach((lang, index) => {
            result[lang as keyof TranslatedText] = translations[index];
        });

        return result;
    } catch (error) {
        console.error('Translation failed:', error);
        // Fallback: use original text for all languages
        return { ar: text, en: text, fr: text };
    }
}

/**
 * Batch translate multiple texts (for description, etc.)
 */
export async function translateMultiple(texts: string[]): Promise<TranslatedText[]> {
    return Promise.all(texts.map(text => translateText(text)));
}
