// ── Moroccan cities for programmatic SEO pages ────────────────────────────────
export const CITIES = [
    { slug: "casablanca", ar: "الدار البيضاء", en: "Casablanca" },
    { slug: "rabat", ar: "الرباط", en: "Rabat" },
    { slug: "marrakech", ar: "مراكش", en: "Marrakech" },
    { slug: "tanger", ar: "طنجة", en: "Tangier" },
    { slug: "agadir", ar: "أكادير", en: "Agadir" },
    { slug: "fes", ar: "فاس", en: "Fes" },
    { slug: "meknes", ar: "مكناس", en: "Meknes" },
    { slug: "oujda", ar: "وجدة", en: "Oujda" },
    { slug: "kenitra", ar: "القنيطرة", en: "Kenitra" },
    { slug: "tetouan", ar: "تطوان", en: "Tetouan" },
] as const;

// ── Search intents ─────────────────────────────────────────────────────────────
export const INTENTS = [
    { slug: "buy", ar: "اشتري", en: "Buy" },
    { slug: "best", ar: "أفضل", en: "Best" },
    { slug: "cheap", ar: "أرخص", en: "Cheap" },
] as const;

// ── Site base URL ──────────────────────────────────────────────────────────────
export const BASE_URL = "https://store.idmisk.com";

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Parse a slug like "buy-makeup-casablanca" into its components. Returns null if invalid. */
export function parseExploreSlug(slug: string): {
    intent: (typeof INTENTS)[number];
    categorySlug: string;
    city: (typeof CITIES)[number];
} | null {
    // Last token is city slug
    const parts = slug.split("-");
    if (parts.length < 3) return null;

    const citySlug = parts[parts.length - 1];
    const intentSlug = parts[0];

    const city = CITIES.find((c) => c.slug === citySlug);
    const intent = INTENTS.find((i) => i.slug === intentSlug);
    if (!city || !intent) return null;

    // Category slug is everything between intent and city
    const categorySlug = parts.slice(1, parts.length - 1).join("-");

    return { intent, categorySlug, city };
}

/** Build a full explore URL slug */
export function buildExploreSlug(
    intentSlug: string,
    categorySlug: string,
    citySlug: string
): string {
    return `${intentSlug}-${categorySlug}-${citySlug}`;
}
