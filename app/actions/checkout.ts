"use server"

import { adminFirestore } from "@/lib/firebase-admin";
import admin from "firebase-admin";

export async function recordCustomerPurchase(data: {
    id: string;
    name: string;
    phone: string;
    city: string;
    totalSpent: number;
    interests: string[];
}) {
    try {
        const customerRef = adminFirestore.collection("customers").doc(data.id);
        const docSnap = await customerRef.get();

        if (docSnap.exists) {
            await customerRef.set({
                totalSpent: admin.firestore.FieldValue.increment(data.totalSpent),
                ordersCount: admin.firestore.FieldValue.increment(1),
                interests: admin.firestore.FieldValue.arrayUnion(...data.interests),
                lastOrder: new Date().toISOString(),
                city: data.city || docSnap.data()?.city || "",
                name: data.name || docSnap.data()?.name || ""
            }, { merge: true });
        } else {
            await customerRef.set({
                id: data.id,
                name: data.name,
                phone: data.phone,
                city: data.city,
                totalSpent: data.totalSpent,
                ordersCount: 1,
                interests: data.interests,
                lastOrder: new Date().toISOString(),
                createdAt: new Date().toISOString()
            });
        }
        return { success: true };
    } catch (e: any) {
        console.error("Failed to record customer purchase via admin:", e);
        return { success: false, error: e.message };
    }
}
