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

const PROJECT_ID = "altftool";
const extRef = collection(db, "projects", PROJECT_ID, "academy");
const CACHE_KEY = "admin:academy:list";

/* READ */
export async function fetchAcademies() {
  return getCachedFirebaseRead(CACHE_KEY, async () => {
    const q = query(extRef, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
  }, 30000);
}

/* CREATE */
export async function createAcademy(id, data) {
  const ref = doc(extRef, id);

  await setDoc(ref, {
    ...data,
    id,
    createdAt: serverTimestamp(),
  });

  clearFirebaseCache(CACHE_KEY);
  return id;
}

/* UPDATE */
export async function updateAcademy(id, updates) {
  const ref = doc(extRef, id);

  await updateDoc(ref, {
    ...updates,
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
