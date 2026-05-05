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

const PROJECT_ID = "altftool";
const extRef = collection(db, "projects", PROJECT_ID, "extensions");

/* =========================
   READ
========================= */

export async function fetchExtensions() {
  const snap = await getDocs(extRef);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
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

  return id;
}

/* =========================
   UPDATE
========================= */

export async function updateExtension(id, updates) {
  const ref = doc(extRef, id);
  return updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/* =========================
   DELETE
========================= */

export async function deleteExtension(id) {
  const ref = doc(extRef, id);
  return deleteDoc(ref);
}