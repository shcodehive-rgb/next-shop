interface RecentlyViewedProduct {
    id: string;
    title: string | { [key: string]: string };
    price: string;
    image: string;
    viewedAt: number;
}

const STORAGE_KEY = 'recentlyViewed';
const MAX_ITEMS = 5;

// Add product to recently viewed
export function addToRecentlyViewed(product: {
    id: string;
    title: string | { [key: string]: string };
    price: string;
    image: string;
}) {
    if (typeof window === 'undefined') return; // Skip on server-side

    try {
        // Get existing recently viewed products
        const existing: RecentlyViewedProduct[] = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || '[]'
        );

        // Remove if already exists (to update timestamp)
        const filtered = existing.filter(item => item.id !== product.id);

        // Add new product with current timestamp
        const newItem: RecentlyViewedProduct = {
            ...product,
            viewedAt: Date.now()
        };

        // Combine and keep only the most recent MAX_ITEMS
        const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);

        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error('Error saving to recently viewed:', error);
    }
}

// Get recently viewed products
export function getRecentlyViewed(): RecentlyViewedProduct[] {
    if (typeof window === 'undefined') return [];

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error getting recently viewed:', error);
        return [];
    }
}

// Clear recently viewed products
export function clearRecentlyViewed() {
    if (typeof window === 'undefined') return;
    
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Error clearing recently viewed:', error);
    }
}
