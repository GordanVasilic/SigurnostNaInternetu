import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
);

let db: Database | null = null;

if (typeof window !== "undefined" && isFirebaseConfigured) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getDatabase(app);
  } catch (err) {
    console.warn("Firebase initialization error:", err);
  }
}

export { db };
