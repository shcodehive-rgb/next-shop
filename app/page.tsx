import { redirect } from 'next/navigation';


// 🛑 SERVER-SIDE LOGIC FOR ROOT REDIRECT
// We use Firebase Admin SDK (if possible) or Client SDK on server? 
// Edge/Node runtime issues might occur with Client SDK on Server Components sometimes.
// Ideally, we just use the Client Code but in a Server Component.

// Let's stick to the Client SDK which works in Next.js Server Components usually
// BUT better safe: we can just hardcode default for now OR try reading.
// Wait, initializing simple firebase app in server component is fine.

import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default async function RootPage() {
  // 1. Default Fallback
  let defaultLocale = 'ar';

  try {
    // 2. Try fetching from Firestore
    // Note: getDoc on Server Component works if environment is Node.js
    const settingsRef = doc(db, "settings", "general");
    const snap = await getDoc(settingsRef);

    if (snap.exists()) {
      const data = snap.data();
      if (data.default_locale) {
        defaultLocale = data.default_locale;
      }
    }
  } catch (error) {
    console.error("Error fetching default locale:", error);
  }

  // 3. Redirect
  redirect(`/${defaultLocale}`);
}
