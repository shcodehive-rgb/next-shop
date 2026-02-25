const MAKE_WEBHOOK_URL = "https://hook.eu1.make.com/hp31ggbk9u1ckmm3kbayttf5bcsl4fnq";
const BASE_URL = "https://store.idmisk.com";

interface WebhookProduct {
    id: string;
    title: any;
    description?: any;
    price: string | number;
    images?: string[];
    image?: string;
}

/**
 * Fires the Make.com webhook after a new product is saved.
 * Safe to call fire-and-forget — errors are caught and logged, never thrown.
 */
export async function notifyMakeWebhook(product: WebhookProduct, locale = "ar"): Promise<void> {
    try {
        // Resolve localised title
        const title =
            typeof product.title === "string"
                ? product.title
                : product.title?.[locale] || product.title?.ar || product.title?.en || "Product";

        // Resolve localised description
        const description =
            !product.description
                ? ""
                : typeof product.description === "string"
                    ? product.description
                    : product.description?.[locale] || product.description?.ar || product.description?.en || "";

        // Primary image URL
        const imageUrl =
            (product.images && product.images.length > 0 ? product.images[0] : product.image) || "";

        const productUrl = `${BASE_URL}/ar/product/${product.id}`;

        const payload = {
            title,
            description: description.substring(0, 1000),
            price: `${product.price} MAD`,
            imageUrl,
            productUrl,
        };

        const res = await fetch(MAKE_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            console.warn(`[Make.com] Webhook responded with ${res.status}`);
        } else {
            console.log("[Make.com] Webhook fired successfully for product:", product.id);
        }
    } catch (err) {
        // Non-blocking — a webhook failure must never break product saving
        console.error("[Make.com] Webhook error:", err);
    }
}
