// services/data.service.js

import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

const PROJECT_ID = "altftool";
const dataRef = collection(db, "projects", PROJECT_ID, "pintrest");

// Read all data items for the pintrest module (one-time)
export async function fetchData() {
  const snap = await getDocs(dataRef);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Realtime listener for pintrest pins
// Returns an unsubscribe function – call it in useEffect cleanup
export function subscribePins(callback) {
  return onSnapshot(
    dataRef,
    (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    (error) => {
      console.error("[subscribePins] Firestore listener error:", error);
    }
  );
}

// Create a new pin for the pintrest module
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

// Update existing pin for the pintrest module
export async function updateData(id, updates) {
  const ref = doc(dataRef, id);
  return updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
}

// Delete pin for the pintrest module
export async function deleteData(id) {
  const ref = doc(dataRef, id);
  return deleteDoc(ref);
}