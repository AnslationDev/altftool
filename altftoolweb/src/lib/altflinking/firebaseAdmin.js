/**
 * Firebase Admin SDK Singleton
 * Location: src/lib/altflinking/firebaseAdmin.js
 *
 * Used ONLY in Next.js API routes (server-side).
 * Never import this in client components.
 */

import { getApps, getApp, initializeApp, cert } from "firebase-admin/app";
import { getFirestore }  from "firebase-admin/firestore";
import { getAuth }       from "firebase-admin/auth";

function getServiceAccount() {
  // Option 1: Full JSON string in env var (Vercel / Railway / etc.)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } catch {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is malformed JSON");
    }
  }
  // Option 2: Individual fields (simpler for local .env.local)
  if (process.env.FIREBASE_ADMIN_PROJECT_ID) {
    return {
      projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey:  (process.env.FIREBASE_ADMIN_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    };
  }
  return null;
}

let _app   = null;
let _db    = null;
let _auth  = null;
let _ready = false;

export function initAdmin() {
  if (_ready) return { db: _db, auth: _auth, ready: true };

  const serviceAccount = getServiceAccount();
  if (!serviceAccount) {
    console.warn("[FirebaseAdmin] No service account configured — API routes will return 503.");
    return { db: null, auth: null, ready: false };
  }

  try {
    _app   = getApps().length > 0 ? getApp() : initializeApp({ credential: cert(serviceAccount) });
    _db    = getFirestore(_app);
    _auth  = getAuth(_app);
    _ready = true;
    return { db: _db, auth: _auth, ready: true };
  } catch (e) {
    console.error("[FirebaseAdmin] Init error:", e.message);
    return { db: null, auth: null, ready: false };
  }
}

