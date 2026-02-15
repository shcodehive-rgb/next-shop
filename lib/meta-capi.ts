export async function sendMetaCAPIEvent(eventName: string, eventData: any, req?: Request) {
    const pixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
    const token = process.env.FACEBOOK_CONVERSIONS_API_TOKEN;

    if (!pixelId || !token) {
        console.error("❌ Meta CAPI Missing Credentials");
        return;
    }

    const url = `https://graph.facebook.com/v17.0/${pixelId}/events?access_token=${token}`;

    const payload = {
        data: [
            {
                event_name: eventName,
                event_time: Math.floor(Date.now() / 1000),
                action_source: "website",
                ...eventData
            }
        ]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("❌ Meta CAPI Error:", data);
        } else {
            console.log("✅ Meta CAPI Sent Successfully:", eventName);
        }
        return data;
    } catch (error) {
        console.error("❌ Meta CAPI Network Error:", error);
    }
}
