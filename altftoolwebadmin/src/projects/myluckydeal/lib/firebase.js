"use client";

/**
 * Firebase for the My Lucky Deals admin module.
 *
 * Configuration comes EXCLUSIVELY from the host app:
 *   1. If the host app has already initialized a default Firebase app,
 *      that instance is reused (preferred — single source of truth).
 *   2. Otherwise it initializes from the host's NEXT_PUBLIC_FIREBASE_* env vars.
 *
 * No keys, project ids, or other configuration are hardcoded here.
 * If neither source is available, `isFirebaseConfigured` is false and the
 * UI renders a setup screen instead of crashing.
 */
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore, collection, doc, getDoc, getDocs, setDoc, deleteDoc, serverTimestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";

const envConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app = null;
if (getApps().length) {
  app = getApp(); // reuse the host app's Firebase instance
} else if (envConfig.apiKey && envConfig.projectId) {
  try {
    app = initializeApp(envConfig);
  } catch (error) {
    console.error("[myluckydeal-admin] Firebase init failed:", error);
  }
}

export const isFirebaseConfigured = Boolean(app);
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;
export const auth = app ? getAuth(app) : null;

const ensure = () => {
  if (!app) {
    throw new Error(
      "Firebase is not configured. Set the NEXT_PUBLIC_FIREBASE_* variables in the host app's .env.local (see README.md)."
    );
  }
};

/**
 * All My Lucky Deals content lives under `projects/myluckydeal/<collection>`
 * — consistent with the ALTFTool platform architecture (each project owns
 * its own Firestore namespace; no top-level collection collisions).
 */
const PROJECT_ROOT = ["projects", "myluckydeal"];
const colRef = (name) => collection(db, ...PROJECT_ROOT, name);
const docRef = (name, id) => doc(db, ...PROJECT_ROOT, name, id);

/* ------------------------------ Auth helpers ------------------------------ */
export const watchAuth = (cb) => {
  if (!auth) { cb(null); return () => {}; }
  return onAuthStateChanged(auth, cb);
};
export const login = (email, password) => { ensure(); return signInWithEmailAndPassword(auth, email, password); };
export const logout = () => { ensure(); return signOut(auth); };

/* ------------------------------ CRUD helpers ------------------------------ */
export async function listDocs(colName) {
  ensure();
  const snap = await getDocs(colRef(colName));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getDocById(colName, id) {
  ensure();
  const snap = await getDoc(docRef(colName, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function saveDoc(colName, id, data, { isNew = false } = {}) {
  ensure();
  const user = auth?.currentUser;
  const payload = {
    ...data,
    updatedAt: serverTimestamp(),
    updatedBy: user?.email || "panel",
    ...(isNew ? { createdAt: serverTimestamp() } : {}),
  };
  await setDoc(docRef(colName, id), payload, { merge: true });
  return { id, ...payload };
}

export async function removeDoc(colName, id) {
  ensure();
  await deleteDoc(docRef(colName, id));
}

/* ------------------------------ Storage upload ---------------------------- */
export async function uploadImage(file, folder, name) {
  ensure();
  const clean = (name || file.name).toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
  const path = `projects/myluckydeal/media/${folder}/${Date.now()}-${clean}`;
  const r = ref(storage, path);
  await uploadBytes(r, file);
  return getDownloadURL(r);
}
