/**
 * Firebase App Singleton for ALTFTool Backlink Marketplace
 * Location: src/app/altflinking/services/firebase.js
 *
 * SETUP: Add your Firebase credentials to .env.local
 * (see .env.local.altflinking.example in the project root)
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Singleton pattern — prevents "Firebase App named '[DEFAULT]' already exists" error
// during Next.js hot module replacement
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);

// Google Auth Provider — pre-configured with required scopes
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("profile");
googleProvider.addScope("email");
// Force account chooser every time so users can switch accounts
googleProvider.setCustomParameters({ prompt: "select_account" });
