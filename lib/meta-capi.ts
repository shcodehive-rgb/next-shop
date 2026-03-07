import crypto from "crypto";

const PIXEL_ID = process.env.META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
const GRAPH_API_VERSION = "v20.0";

/** SHA-256 hash helper (Meta requires hashed user data) */
function hash(value: string): string {
    return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export interface MetaEventOptions {
    /** e.g. "PageView", "Purchase", "AddToCart" */
    eventName: string;
    /** ISO string or Unix timestamp — defaults to now */
    eventTime?: number;
    /** Deduplication ID — must match the browser pixel's eventID */
    eventId?: string;
    /** Full page URL */
    eventSourceUrl?: string;
    /** Client IP forwarded from the request headers */
    clientIpAddress?: string;
    /** User-agent forwarded from the request headers */
    clientUserAgent?: string;
    /** Raw email — will be hashed automatically */
    email?: string;
    /** Raw phone — will be hashed automatically */
    phone?: string;
    /** Extra custom_data payload (e.g. value, currency for Purchase) */
    customData?: Record<string, unknown>;
}

/**
 * Send a single server-side event to Meta's Conversions API.
 * Credentials are read from META_PIXEL_ID and META_CAPI_ACCESS_TOKEN env vars.
 */
export async function sendMetaCAPIEvent(options: MetaEventOptions) {
    if (!PIXEL_ID || !ACCESS_TOKEN) {
        console.error("❌ Meta CAPI: META_PIXEL_ID or META_CAPI_ACCESS_TOKEN is missing");
        return { error: "Missing CAPI credentials" };
    }

    const {
        eventName,
        eventTime = Math.floor(Date.now() / 1000),
        eventId,
        eventSourceUrl,
        clientIpAddress,
        clientUserAgent,
        email,
        phone,
        customData,
    } = options;

    // Build user_data object — only include fields that are present
    const userData: Record<string, string> = {};
    if (email) userData.em = hash(email);
    if (phone) userData.ph = hash(phone);
    if (clientIpAddress) userData.client_ip_address = clientIpAddress;
    if (clientUserAgent) userData.client_user_agent = clientUserAgent;

    const eventPayload: Record<string, unknown> = {
        event_name: eventName,
        event_time: eventTime,
        action_source: "website",
        user_data: userData,
    };

    if (eventId) eventPayload.event_id = eventId;
    if (eventSourceUrl) eventPayload.event_source_url = eventSourceUrl;
    if (customData) eventPayload.custom_data = customData;

    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: [eventPayload] }),
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("❌ Meta CAPI Error:", result);
            return { error: result };
        }

        console.log(`✅ Meta CAPI [${eventName}] sent — events_received:`, result?.events_received);
        return result;
    } catch (err) {
        console.error("❌ Meta CAPI Network Error:", err);
        return { error: String(err) };
    }
}

/**
 * Convenience wrapper: send a PageView event.
 * Pass the Next.js request headers so Meta receives accurate IP + UA.
 */
export async function sendPageViewEvent(opts: {
    url: string;
    ip?: string;
    userAgent?: string;
    eventId?: string;
}) {
    return sendMetaCAPIEvent({
        eventName: "PageView",
        eventSourceUrl: opts.url,
        clientIpAddress: opts.ip,
        clientUserAgent: opts.userAgent,
        eventId: opts.eventId,
    });
}
