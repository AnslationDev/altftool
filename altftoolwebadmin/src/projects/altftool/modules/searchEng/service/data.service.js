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

import { db } from "@/lib/firebaseFirestore";

const PROJECT_ID = "altftool";
const dataRef = collection(db, "projects", PROJECT_ID, "GlobalSearch");
const categoriesRef = collection(db, "projects", PROJECT_ID, "GlobalCategories");

// Read all data items for the global search module (one-time)
export async function fetchData() {
  const snap = await getDocs(dataRef);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Realtime listener for global search items
// Returns an unsubscribe function – call it in useEffect cleanup
export function subscribeGlobalSearch(callback, onError) {
  return onSnapshot(
    dataRef,
    (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    (error) => {
      console.error("[subscribeGlobalSearch] Firestore listener error:", error);
      onError?.(error);
    }
  );
}

// Create a new global search item
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

// Update existing global search item
export async function updateData(id, updates) {
  const ref = doc(dataRef, id);
  return updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
}

// Delete global search item
export async function deleteData(id) {
  const ref = doc(dataRef, id);
  return deleteDoc(ref);
}

// Realtime listener for categories
export function subscribeCategories(callback, onError) {
  return onSnapshot(
    categoriesRef,
    (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    (error) => {
      console.error("[subscribeCategories] Firestore listener error:", error);
      onError?.(error);
    }
  );
}

// Create a new category
export async function createCategory(id, payload) {
  const ref = doc(categoriesRef, id);
  await setDoc(ref, {
    ...payload,
    id,
    createdAt: serverTimestamp(),
  });
  return id;
}
