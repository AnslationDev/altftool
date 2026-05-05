//services/data.service.js

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
const dataRef = collection(db, "projects", PROJECT_ID, "navigation", "data", "items");

/* =========================
   READ
========================= */
export async function fetchData() {
  const snap = await getDocs(dataRef);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/* =========================
   CREATE
========================= */
export async function createData(id, payload) {
  const ref = doc(dataRef, id);
  await setDoc(ref, {
    ...payload,
    id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return id;
}

/* =========================
   UPDATE
========================= */
export async function updateData(id, updates) {
  const ref = doc(dataRef, id);
  return updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
}

/* =========================
   DELETE
========================= */
export async function deleteData(id) {
  const ref = doc(dataRef, id);
  return deleteDoc(ref);
}