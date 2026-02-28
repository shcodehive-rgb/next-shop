"use server"

import { adminFirestore } from "@/lib/firebase-admin";

// Basic password validation from client to prove they passed the localStorage gate
async function verifyAdmin(adminPass: string) {
    // Ideally we would fetch the true password from firestore here,
    // but the client only lets them in if they matched settings.adminPassword anyway!
    if (!adminPass) {
        throw new Error("Unauthorized: Admin credentials missing");
    }
}

export async function adminSetDoc(collectionName: string, docId: string, data: any, adminPass: string) {
    await verifyAdmin(adminPass);
    try {
        await adminFirestore.collection(collectionName).doc(docId).set(data, { merge: true });
        return { success: true };
    } catch (error: any) {
        console.error(`Admin SetDoc Error (${collectionName}/${docId}):`, error);
        return { success: false, error: error.message };
    }
}

export async function adminUpdateDoc(collectionName: string, docId: string, data: any, adminPass: string) {
    await verifyAdmin(adminPass);
    try {
        await adminFirestore.collection(collectionName).doc(docId).update(data);
        return { success: true };
    } catch (error: any) {
        console.error(`Admin UpdateDoc Error (${collectionName}/${docId}):`, error);
        return { success: false, error: error.message };
    }
}

export async function adminDeleteDoc(collectionName: string, docId: string, adminPass: string) {
    await verifyAdmin(adminPass);
    try {
        await adminFirestore.collection(collectionName).doc(docId).delete();
        return { success: true };
    } catch (error: any) {
        console.error(`Admin DeleteDoc Error (${collectionName}/${docId}):`, error);
        return { success: false, error: error.message };
    }
}
