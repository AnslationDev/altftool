import { initializeApp, getApps } from "firebase/app";

// Falls back to the same public client config already committed in
// src/lib/firebase.js (a Firebase Web apiKey is not a secret — access is
// restricted via Firebase console rules/domain allowlisting), so /imgprompt
// works out of the box in this environment without a separate .env.local.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAYKc0SBXyY3bfKLkmcCrPf-NsPF8p_Z50",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "altftool-bca36.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "altftool-bca36",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "altftool-bca36.firebasestorage.app",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:111638030249:web:caeabc577fba8b5b29c6b8",
};

export const isAuthConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

// Named app instance so this route never collides with (or depends on) the
// site-wide Firebase app initialized in src/lib/firebase.js — /imgprompt's
// auth stays fully self-contained per the SITE_ROUTES isolation convention.
const IMGPROMPT_APP_NAME = "imgprompt-auth";

function getImgPromptApp() {
  const existing = getApps().find((a) => a.name === IMGPROMPT_APP_NAME);
  if (existing) return existing;
  return initializeApp(firebaseConfig, IMGPROMPT_APP_NAME);
}

let cachedAuth = null;

export async function getImgPromptAuth() {
  if (!isAuthConfigured) return null;
  if (cachedAuth) return cachedAuth;
  const { getAuth } = await import("firebase/auth");
  cachedAuth = getAuth(getImgPromptApp());
  return cachedAuth;
}
