// src/services/extensions.service.js

import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { clearFirebaseCache, getCachedFirebaseRead } from "@/lib/firebaseCache";
import { compactFirestoreData, normalizeAcademy } from "@altftool/core/firebaseContent";
import { ALTFT_ACADEMY_COLLECTION_PATH } from "@altftool/core/firebasePaths";

const extRef = collection(db, ...ALTFT_ACADEMY_COLLECTION_PATH);
const CACHE_KEY = "admin:academy:list";

/* READ */
export async function fetchAcademies() {
  return getCachedFirebaseRead(CACHE_KEY, async () => {
    const q = query(extRef, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    return snap.docs.map((d) => normalizeAcademy(d.data(), d.id));
  }, 30000);
}

/* CREATE */
export async function createAcademy(id, data) {
  const ref = doc(extRef, id);
  const payload = compactFirestoreData(normalizeAcademy(data, id));

  await setDoc(ref, {
    ...payload,
    id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  clearFirebaseCache(CACHE_KEY);
  return id;
}

/* UPDATE */
export async function updateAcademy(id, updates) {
  const ref = doc(extRef, id);
  const payload = compactFirestoreData(normalizeAcademy(updates, id));

  await updateDoc(ref, {
    ...payload,
    updatedAt: serverTimestamp(),
  });
  clearFirebaseCache(CACHE_KEY);
}

/* DELETE */
export async function deleteAcademy(id) {
  const ref = doc(extRef, id);
  await deleteDoc(ref);
  clearFirebaseCache(CACHE_KEY);
}
