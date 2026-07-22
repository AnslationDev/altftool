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
  getFirestore, collection, doc, getDoc, getDocs,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL } from "firebase/storage";
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
    console.error("[anternet-admin] Firebase init failed:", error);
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
 * All Anternet content lives under `projects/anternet/<collection>`
 * — consistent with the ALTFTool platform architecture (each project owns
 * its own Firestore namespace; no top-level collection collisions).
 */
const PROJECT_ROOT = ["projects", "anternet"];
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

/**
 * Saves/deletes go through server API routes backed by the Firebase Admin
 * SDK (see /api/anternet/save and /api/anternet/delete) instead of the
 * client Firestore SDK. This keeps writes working regardless of the
 * client's Firestore security-rule/auth state (e.g. the "Local Admin"
 * dev session, which never performs real Firebase Auth and previously
 * caused "Missing or insufficient permissions" on Save).
 */
async function callAnternetApi(path, body) {
  const user = auth?.currentUser;
  const idToken = user ? await user.getIdToken().catch(() => null) : null;
  const res = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const result = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(result.error || `Request failed (${res.status})`);
  return result;
}

export async function saveDoc(colName, id, data, { isNew = false } = {}) {
  ensure();
  await callAnternetApi("/api/anternet/save", { collection: colName, id, data, isNew });
  return { id, ...data };
}

export async function removeDoc(colName, id) {
  ensure();
  await callAnternetApi("/api/anternet/delete", { collection: colName, id });
}

/**
 * Persists a drag-and-drop reorder — writes each doc's new `order` index
 * (its position in `orderedIds`) through the same `saveDoc` every other
 * write uses. Card counts here are small (single digits to low tens), so N
 * parallel writes is simpler than standing up a batch-write route.
 */
export async function reorderDocs(colName, orderedIds) {
  ensure();
  await Promise.all(
    orderedIds.map((id, i) => saveDoc(colName, id, { order: i }, { isNew: false }))
  );
}

/* ------------------------------ Storage upload ---------------------------- */
export async function uploadImage(file, folder, name) {
  ensure();
  const clean = (name || file.name).toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
  const path = `projects/anternet/media/${folder}/${Date.now()}-${clean}`;
  const r = ref(storage, path);
  await uploadBytes(r, file);
  return getDownloadURL(r);
}

/**
 * Resumable upload with progress — used by the Video Sections "Upload Video"
 * and "Thumbnail Upload" fields only. `uploadImage` above is left untouched
 * so every other module that calls it (banners, tasks, quiz, spin, ads,
 * earningtasks) is completely unaffected by this addition.
 */
function uploadWithProgress(file, path, onProgress) {
  ensure();
  const r = ref(storage, path);
  const task = uploadBytesResumable(r, file);
  return new Promise((resolve, reject) => {
    task.on(
      "state_changed",
      (snap) => onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      reject,
      async () => { try { resolve(await getDownloadURL(task.snapshot.ref)); } catch (e) { reject(e); } }
    );
  });
}

export async function uploadVideoFile(file, folder, name, onProgress) {
  const clean = (name || file.name).toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
  const path = `projects/anternet/media/${folder}/${Date.now()}-${clean}`;
  return uploadWithProgress(file, path, onProgress);
}

export async function uploadThumbnail(file, folder, name, onProgress) {
  const clean = (name || file.name).toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
  const path = `projects/anternet/media/${folder}/${Date.now()}-${clean}`;
  return uploadWithProgress(file, path, onProgress);
}
