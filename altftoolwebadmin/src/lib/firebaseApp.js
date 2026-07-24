import { getApp, getApps, initializeApp } from "firebase/app";

export const firebaseConfig = {
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

export const firebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);
