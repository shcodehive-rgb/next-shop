"use client";

import { useShop } from "@/context/ShopContext";
import StoreSuspended from "@/components/StoreSuspended";

export default function StoreProtectedWrapper({ children }: { children: React.ReactNode }) {
    const { isStoreActive } = useShop();

    // Prevent hydration mismatch or flash by waiting? 
    // Actually context default is true, so checking !isStoreActive is safe immediately if we want to default to active.

    if (!isStoreActive) return <StoreSuspended />;

    return <>{children}</>;
}
