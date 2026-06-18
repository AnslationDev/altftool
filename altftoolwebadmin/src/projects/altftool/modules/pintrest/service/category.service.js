// service/category.service.js

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
const categoryRef = collection(db, "projects", PROJECT_ID, "pintrest_categories");

// Read all categories (one-time)
export async function fetchCategories() {
  const snap = await getDocs(categoryRef);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Realtime listener for categories
// Returns an unsubscribe function
export function subscribeCategories(callback) {
  return onSnapshot(
    categoryRef,
    (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    (error) => {
      console.error("[subscribeCategories] Firestore listener error:", error);
    }
  );
}

// Create a new category
export async function createCategory(id, payload) {
  const ref = doc(categoryRef, id);
  await setDoc(ref, {
    ...payload,
    id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return id;
}

// Update an existing category
export async function updateCategory(id, updates) {
  const ref = doc(categoryRef, id);
  return updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
}

// Delete a category
export async function deleteCategory(id) {
  const ref = doc(categoryRef, id);
  return deleteDoc(ref);
}
