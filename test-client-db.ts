import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDHONV5RoykHSu876h6WWedRrL60J87KMs",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "amina-saas.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "amina-saas",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "546339573391",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:546339573391:web:fb6eea45de143c696eeafa",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-22Z7G0P46H",
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://amina-saas-default-rtdb.firebaseio.com",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "amina-saas.firebasestorage.app"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testClient() {
    console.log("Testing Client SDK Connection...");
    try {
        const snap = await getDocs(collection(db, "products"));
        console.log(`Client SDK fetched ${snap.size} products.`);
    } catch (e) {
        console.error("Client SDK Fetch Error:", e.name, e.message);
    }
}

testClient();
