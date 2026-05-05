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

const PROJECT_ID = "altftool";
const extRef = collection(db, "projects", PROJECT_ID, "academy");

/* READ */
export async function fetchAcademies() {
  const q = query(extRef, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

/* CREATE */
export async function createAcademy(id, data) {
  const ref = doc(extRef, id);

  await setDoc(ref, {
    ...data,
    id,
    createdAt: serverTimestamp(),
  });

  return id;
}

/* UPDATE */
export async function updateAcademy(id, updates) {
  const ref = doc(extRef, id);

  return updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/* DELETE */
export async function deleteAcademy(id) {
  const ref = doc(extRef, id);
  return deleteDoc(ref);
}