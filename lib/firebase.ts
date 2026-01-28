import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// Storage removed

import imageCompression from 'browser-image-compression';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDHONV5RoykHSu876h6WWedRrL60J87KMs",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "amina-saas.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "amina-saas",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "546339573391",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:546339573391:web:fb6eea45de143c696eeafa",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-22Z7G0P46H",
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://amina-saas-default-rtdb.firebaseio.com"
};

import { getFirestore } from "firebase/firestore";

// Initialize Firebase (Singleton pattern)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const rtdb = getDatabase(app);
const db = getFirestore(app);
// const storage = getStorage(app); // REMOVED


export { app, rtdb, db };


