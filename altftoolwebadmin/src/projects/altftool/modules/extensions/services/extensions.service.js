// src/services/extensions.service.js

import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { clearFirebaseCache, getCachedFirebaseRead } from "@/lib/firebaseCache";
import { compactFirestoreData, normalizeExtension } from "@altftool/core/firebaseContent";
import { ALTFT_EXTENSIONS_COLLECTION_PATH } from "@altftool/core/firebasePaths";

const extRef = collection(db, ...ALTFT_EXTENSIONS_COLLECTION_PATH);
const CACHE_KEY = "admin:extensions:list";

/* =========================
   READ
========================= */

export async function fetchExtensions() {
  return getCachedFirebaseRead(CACHE_KEY, async () => {
    const snap = await getDocs(extRef);
    return snap.docs.map((d) => normalizeExtension(d.data(), d.id));
  }, 30000);
}

/* =========================
   CREATE
========================= */

export async function createExtension(id, data) {
  const ref = doc(extRef, id);
  const payload = compactFirestoreData(normalizeExtension(data, id));

  await setDoc(ref, {
    ...payload,
    id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  clearFirebaseCache(CACHE_KEY);
  return id;
}

/* =========================
   UPDATE
========================= */

export async function updateExtension(id, updates) {
  const ref = doc(extRef, id);
  const payload = compactFirestoreData(normalizeExtension(updates, id));
  await updateDoc(ref, {
    ...payload,
    updatedAt: serverTimestamp(),
  });
  clearFirebaseCache(CACHE_KEY);
}

/* =========================
   DELETE
========================= */

export async function deleteExtension(id) {
  const ref = doc(extRef, id);
  await deleteDoc(ref);
  clearFirebaseCache(CACHE_KEY);
}
