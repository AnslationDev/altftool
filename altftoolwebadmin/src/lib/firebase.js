import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  memoryLocalCache,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyAYKc0SBXyY3bfKLkmcCrPf-NsPF8p_Z50",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "altftool-bca36.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "altftool-bca36",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "altftool-bca36.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "111638030249",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:111638030249:web:caeabc577fba8b5b29c6b8",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

/**
 * Single Firestore instance per page load.
 *
 * We intentionally use an in-memory cache (NOT IndexedDB persistence). The
 * admin panel is always online (auth + APIs), and multi-tab IndexedDB
 * persistence is what produced the recurring, benign
 * "Failed to obtain primary lease for action 'Backfill Indexes' /
 * 'Apply remote event'" warnings — only one tab can hold the persistence
 * lease, so every other tab (and every dev HMR reload) logged it. An
 * in-memory cache has no cross-tab lease coordination, so the warning is
 * gone, data stays fresh, and reads are unaffected for an online tool.
 *
 * The instance is cached on globalThis so Fast Refresh / repeated module
 * evaluation never re-initialises Firestore (which would throw or churn).
 */
function createFirestore(appInstance) {
  if (typeof window === "undefined") return getFirestore(appInstance);
  if (globalThis.__ALTFT_FIRESTORE__) return globalThis.__ALTFT_FIRESTORE__;

  let instance;
  try {
    instance = initializeFirestore(appInstance, { localCache: memoryLocalCache() });
  } catch {
    instance = getFirestore(appInstance);
  }
  globalThis.__ALTFT_FIRESTORE__ = instance;
  return instance;
}

export const auth = getAuth(app);
export const db = createFirestore(app);
export const storage = getStorage(app);

/**
 * Lazily initialise Firebase Messaging only in browser environments
 * that support it (requires HTTPS / service worker support).
 * Returns null on server or in unsupported browsers — callers must guard.
 */
export async function getFirebaseMessaging() {
  if (typeof window === "undefined") return null;
  const supported = await isSupported();
  if (!supported) return null;
  return getMessaging(app);
}
