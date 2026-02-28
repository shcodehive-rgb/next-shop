import admin from 'firebase-admin';

function getServiceAccount() {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountKey) {
        return JSON.parse(serviceAccountKey);
    }
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
        return {
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        };
    }
    return null;
}

const serviceAccount = getServiceAccount();

if (!admin.apps.length) {
    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } else {
        admin.initializeApp({
            credential: admin.credential.applicationDefault()
        });
    }
}

const db = admin.firestore();

async function testFetch() {
    console.log("Testing Firestore Connection...");
    try {
        const productsSnap = await db.collection("products").limit(1).get();
        console.log(`Found ${productsSnap.size} products.`);
        productsSnap.forEach(doc => {
            const data = doc.data();
            console.log(JSON.stringify({ id: doc.id, ...data }, null, 2));
        });

    } catch (e) {
        console.error("Error connecting to Firestore:", e);
    }
}

testFetch();
