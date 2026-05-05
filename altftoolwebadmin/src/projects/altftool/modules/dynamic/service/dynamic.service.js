import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

const PROJECT_ID = "altftool";
const baseRef = doc(
  db,
  "projects",
  PROJECT_ID,
  "navigation",
  "dynamic"
);

/* =========================
   READ
========================= */
export async function fetchDynamicRoute() {
  const snap = await getDoc(baseRef);
  if (!snap.exists()) return null;
  return snap.data();
}

/* =========================
   UPSERT (CREATE / UPDATE)
========================= */
export async function upsertDynamicRoute(data) {
  const snap = await getDoc(baseRef);

  if (snap.exists()) {
    return updateDoc(baseRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  return setDoc(baseRef, {
    ...data,
    createdAt: serverTimestamp(),
  });
}