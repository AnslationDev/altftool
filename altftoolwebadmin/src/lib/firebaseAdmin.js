import admin from "firebase-admin";
import { requireServerEnvGroup } from "@altftool/core/env";

let cachedAuth = null;
let cachedDb = null;
let cachedMessaging = null;

function getFirebaseAdminApp() {
  if (admin.apps.length) return admin.app();

  const {
    FIREBASE_PROJECT_ID: projectId,
    FIREBASE_CLIENT_EMAIL: clientEmail,
    FIREBASE_PRIVATE_KEY,
  } = requireServerEnvGroup(
    ["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY"],
    "Firebase Admin credentials"
  );

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });

  return admin.app();
}

export function getAdminAuth() {
  if (!cachedAuth) cachedAuth = getFirebaseAdminApp().auth();
  return cachedAuth;
}

export function getAdminDb() {
  if (!cachedDb) cachedDb = getFirebaseAdminApp().firestore();
  return cachedDb;
}

export function getAdminMessaging() {
  if (!cachedMessaging) cachedMessaging = getFirebaseAdminApp().messaging();
  return cachedMessaging;
}

function lazyAdminProxy(getTarget) {
  return new Proxy(
    {},
    {
      get(_target, prop) {
        const target = getTarget();
        const value = target[prop];
        return typeof value === "function" ? value.bind(target) : value;
      },
    }
  );
}

export const adminAuth = lazyAdminProxy(getAdminAuth);
export const adminDb = lazyAdminProxy(getAdminDb);
export const adminMessaging = lazyAdminProxy(getAdminMessaging);
