import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
    // This typically corresponds to the `[locale]` segment
    let locale = await requestLocale;

    // Validate that the incoming `locale` parameter is valid
    // @ts-ignore
    if (!locale || !['ar', 'en', 'fr'].includes(locale)) {
        locale = 'ar';
    }

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default
    };
});
