import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";

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
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:111638030249:web:caeabc577fba8b5b29c6b8",
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.appId &&
    firebaseConfig.projectId !== "build-placeholder"
);

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

function createFirestore(appInstance) {
  if (typeof window === "undefined") return getFirestore(appInstance);

  try {
    return initializeFirestore(appInstance, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } catch {
    return getFirestore(appInstance);
  }
}

export const db = createFirestore(app);

let cachedStorage = null;

export async function getFirebaseStorage() {
  if (!cachedStorage) {
    const { getStorage } = await import("firebase/storage");
    cachedStorage = getStorage(app);
  }
  return cachedStorage;
}

export const storage = null;
