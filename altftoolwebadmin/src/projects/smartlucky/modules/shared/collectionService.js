"use client";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebaseFirestore";
import { SMARTLUCKY_PROJECT_ROOT } from "@altftool/core/firebasePaths";

/**
 * Smart Lucky modules are stored as a SINGLE document per module
 * (projects/smartlucky/<module>/content) holding `{ items: [...] }`,
 * mirroring the TripFindBox single-document editing model. The admin
 * editor loads the whole `items` array, edits it in tabs, and saves
 * the entire array back in one write.
 */
export function getModuleDocRef(moduleName) {
  return doc(db, ...SMARTLUCKY_PROJECT_ROOT, moduleName, "content");
}

export async function fetchModuleItems(moduleName) {
  const snap = await getDoc(getModuleDocRef(moduleName));
  return snap.exists() ? (snap.data().items || []) : [];
}

export async function saveModuleItems(moduleName, items) {
  await setDoc(
    getModuleDocRef(moduleName),
    { items, updatedAt: serverTimestamp() },
    { merge: true }
  );
}
