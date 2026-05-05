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

const PROJECT_ID = "altftool";
const extRef = collection(db, "projects", PROJECT_ID, "extensions");
const CACHE_KEY = "admin:extensions:list";

/* =========================
   READ
========================= */

export async function fetchExtensions() {
  return getCachedFirebaseRead(CACHE_KEY, async () => {
    const snap = await getDocs(extRef);
    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
  }, 30000);
}

/* =========================
   CREATE
========================= */

export async function createExtension(id, data) {
  const ref = doc(extRef, id);

  await setDoc(ref, {
    ...data,
    id,
    createdAt: serverTimestamp(),
  });

  clearFirebaseCache(CACHE_KEY);
  return id;
}

/* =========================
   UPDATE
========================= */

export async function updateExtension(id, updates) {
  const ref = doc(extRef, id);
  await updateDoc(ref, {
    ...updates,
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
