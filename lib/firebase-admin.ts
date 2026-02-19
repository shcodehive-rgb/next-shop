import "server-only";
import admin from "firebase-admin";

// Helper to parse the service account key
function getServiceAccount() {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (serviceAccountKey) {
        try {
            console.log("Found FIREBASE_SERVICE_ACCOUNT_KEY, length:", serviceAccountKey.length);
            return JSON.parse(serviceAccountKey);
        } catch (e) {
            console.error("Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:", e);
        }
    } else {
        console.log("FIREBASE_SERVICE_ACCOUNT_KEY is undefined or empty");
    }

    // Fallback: try individual env vars (common in Vercel)
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
        return {
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            // Replace \\n with \n in private key if strictly needed, though JSON.parse usually handles it if it was stringified
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        };
    }

    return null;
}

// Initialize Admin App
function createAdminApp() {
    if (admin.apps.length > 0) {
        return admin.app();
    }

    const serviceAccount = getServiceAccount();

    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    console.log("Initializing Firebase Admin with Bucket:", bucketName);

    if (serviceAccount) {
        return admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: bucketName
        });
    } else {
        // If no credentials, try default (works on GCP/Vercel with proper IAM)
        // or log warning
        console.warn("⚠️ Firebase Admin: No Service Account found in environment variables.");
        console.warn("   - Expecting 'FIREBASE_SERVICE_ACCOUNT_KEY' or 'FIREBASE_PRIVATE_KEY'/'FIREBASE_CLIENT_EMAIL'.");
        console.warn("   - Attempting to use Default Application Credentials (will fail locally without gcloud auth).");

        return admin.initializeApp({
            credential: admin.credential.applicationDefault(), // Explicitly use default
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
        });
    }
}

const adminApp = createAdminApp();
const adminStorage = admin.storage(adminApp);

export { adminStorage };
